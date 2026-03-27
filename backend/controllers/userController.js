// -------------------- controllers/userController.js --------------------
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const mongoose = require('mongoose');

const execFileAsync = promisify(execFile);
const CONVERTED_DIR = path.join(__dirname, '..', 'converted');
const MAX_CONVERTED_FILE_AGE_MS = 24 * 60 * 60 * 1000;
const ALLOWED_TARGET_FORMATS = new Set([
  'pdf',
  'docx',
  'txt',
  'rtf',
  'html',
  'odt',
  'xlsx',
  'csv',
  'pptx',
]);
const ALLOWED_CONTENT_CATEGORIES = new Set(['movies', 'books', 'videos', 'study materials']);

const sanitizeBaseName = (filename) => {
  const raw = path.parse(filename || 'file').name;
  const clean = raw.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return clean || 'file';
};

const resolveLibreOfficeCandidates = () => {
  const envPath = process.env.LIBREOFFICE_PATH;
  const baseCandidates = process.platform === 'win32'
    ? [
        'soffice.exe',
        'soffice',
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
      ]
    : ['libreoffice', 'soffice', '/usr/bin/libreoffice', '/usr/bin/soffice'];

  if (envPath) {
    return [envPath, ...baseCandidates];
  }

  return baseCandidates;
};

const runLibreOfficeConvert = async (inputPath, outDir, targetFormat) => {
  const args = ['--headless', '--convert-to', targetFormat, '--outdir', outDir, inputPath];
  const candidates = resolveLibreOfficeCandidates();
  let lastError = null;

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, args, { timeout: 120000 });
      return;
    } catch (err) {
      lastError = err;
      if (err && (err.code === 'ENOENT' || err.code === 2)) {
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('LibreOffice command not available');
};

const ensureConvertedDir = async () => {
  await fs.promises.mkdir(CONVERTED_DIR, { recursive: true });
};

const cleanupOldConvertedFiles = async () => {
  try {
    const now = Date.now();
    const files = await fs.promises.readdir(CONVERTED_DIR);
    await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(CONVERTED_DIR, file);
        const stats = await fs.promises.stat(fullPath);
        if (!stats.isFile()) return;
        if (now - stats.mtimeMs > MAX_CONVERTED_FILE_AGE_MS) {
          await fs.promises.unlink(fullPath);
        }
      })
    );
  } catch (err) {
    // cleanup should never break requests
  }
};

const normalizeFileEntry = (entry) => {
  if (typeof entry === 'string') {
    return { url: entry, visibility: 'private', description: '', category: '' };
  }

  if (!entry || typeof entry !== 'object' || !entry.url) {
    return null;
  }

  const category = typeof entry.category === 'string' ? entry.category.trim().toLowerCase() : '';

  return {
    url: entry.url,
    visibility: entry.visibility === 'public' ? 'public' : 'private',
    description: typeof entry.description === 'string' ? entry.description : '',
    category: ALLOWED_CONTENT_CATEGORIES.has(category) ? category : '',
  };
};

const normalizeChannelHandle = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '');

  if (normalized.length < 3 || normalized.length > 30) return '';
  return normalized;
};

const buildChannelUrl = (handle, userId) => {
  if (handle) return `/channel/@${handle}`;
  return `/channel/${userId}`;
};

const generateUniqueChannelHandle = async (seedValue) => {
  const seed = normalizeChannelHandle(seedValue) || `user-${Math.random().toString(36).slice(2, 8)}`;
  let candidate = seed;
  let attempts = 0;

  while (attempts < 25) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await User.findOne({ channelHandle: candidate }).select('_id');
    if (!existing) return candidate;
    attempts += 1;
    candidate = `${seed}-${attempts}`;
  }

  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
};

const resolveChannelUser = async (channelRef) => {
  const ref = String(channelRef || '').trim();
  if (!ref) return null;

  if (ref.startsWith('@')) {
    const handle = normalizeChannelHandle(ref);
    if (!handle) return null;
    return User.findOne({ channelHandle: handle }).select('name channelHandle channelLogoUrl files');
  }

  if (mongoose.Types.ObjectId.isValid(ref)) {
    return User.findById(ref).select('name channelHandle channelLogoUrl files');
  }

  const handle = normalizeChannelHandle(ref);
  if (!handle) return null;
  return User.findOne({ channelHandle: handle }).select('name channelHandle channelLogoUrl files');
};

const mapPublicFilesWithOwner = (users) =>
  users.flatMap((user) =>
    (user.files || [])
      .map(normalizeFileEntry)
      .filter((entry) => entry && entry.visibility === 'public')
      .map((entry) => ({
        ...entry,
        ownerId: String(user._id),
        ownerName: user.name || 'Unknown User',
        ownerHandle: user.channelHandle || '',
        ownerLogoUrl: user.channelLogoUrl || '',
        ownerChannelUrl: buildChannelUrl(user.channelHandle || '', String(user._id)),
      }))
  );


exports.registerUser = async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const requestedHandle = normalizeChannelHandle(req.body.channelHandle);
    const channelHandle = requestedHandle || await generateUniqueChannelHandle(req.body.name || req.body.email);
    await User.create({ name: req.body.name, email: req.body.email, password: hashed, channelHandle });
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.channelHandle) {
      return res.status(400).json({ message: 'Channel handle already taken' });
    }
    return res.status(400).json({ message: 'Email already exists' });
  }
};

exports.loginUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isDisabled) return res.status(403).json({ message: 'Account disabled' });
  if (!(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) });
};

exports.getUserFiles = async (req, res) => {
  if (!req.user.channelHandle) {
    req.user.channelHandle = await generateUniqueChannelHandle(req.user.name || req.user.email);
    await req.user.save();
  }

  const files = req.user.files.map(normalizeFileEntry).filter(Boolean);
  res.json({
    files,
    channel: {
      id: String(req.user._id),
      name: req.user.name || 'My Channel',
      handle: req.user.channelHandle || '',
      logoUrl: req.user.channelLogoUrl || '',
      url: buildChannelUrl(req.user.channelHandle || '', String(req.user._id)),
    },
  });
};

exports.getPublicFiles = async (req, res) => {
  try {
    const users = await User.find().select('name channelHandle channelLogoUrl files');
    const publicFiles = mapPublicFilesWithOwner(users);

    res.json({ files: publicFiles });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public files' });
  }
};

exports.getPublicChannels = async (req, res) => {
  try {
    const users = await User.find().select('name channelHandle channelLogoUrl files');
    const channels = users
      .map((user) => {
        const publicFiles = (user.files || []).map(normalizeFileEntry).filter((entry) => entry && entry.visibility === 'public');
        if (!publicFiles.length) return null;
        return {
          id: String(user._id),
          name: user.name || 'Unknown User',
          handle: user.channelHandle || '',
          logoUrl: user.channelLogoUrl || '',
          url: buildChannelUrl(user.channelHandle || '', String(user._id)),
          publicFileCount: publicFiles.length,
        };
      })
      .filter(Boolean);

    res.json({ channels });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch channels' });
  }
};

exports.getChannelPublicFiles = async (req, res) => {
  try {
    const user = await resolveChannelUser(req.params.channelRef);
    if (!user) return res.status(404).json({ message: 'Channel not found' });

    const files = (user.files || [])
      .map(normalizeFileEntry)
      .filter((entry) => entry && entry.visibility === 'public')
      .map((entry) => ({
        ...entry,
        ownerId: String(user._id),
        ownerName: user.name || 'Unknown User',
        ownerHandle: user.channelHandle || '',
        ownerLogoUrl: user.channelLogoUrl || '',
        ownerChannelUrl: buildChannelUrl(user.channelHandle || '', String(user._id)),
      }));

    res.json({
      channel: {
        id: String(user._id),
        name: user.name || 'Unknown User',
        handle: user.channelHandle || '',
        logoUrl: user.channelLogoUrl || '',
        url: buildChannelUrl(user.channelHandle || '', String(user._id)),
      },
      files,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch channel files' });
  }
};

exports.updateChannelHandle = async (req, res) => {
  try {
    const nextHandle = normalizeChannelHandle(req.body.channelHandle);
    if (!nextHandle) {
      return res.status(400).json({ message: 'Handle must be 3-30 chars using a-z, 0-9, ., -, _' });
    }

    const exists = await User.findOne({ channelHandle: nextHandle }).select('_id');
    if (exists && String(exists._id) !== String(req.user._id)) {
      return res.status(409).json({ message: 'Channel handle already taken' });
    }

    req.user.channelHandle = nextHandle;
    await req.user.save();

    return res.json({
      message: 'Channel handle updated',
      channel: {
        id: String(req.user._id),
        name: req.user.name || 'My Channel',
        handle: req.user.channelHandle,
        logoUrl: req.user.channelLogoUrl || '',
        url: buildChannelUrl(req.user.channelHandle, String(req.user._id)),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update channel handle' });
  }
};

exports.updateChannelLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No logo image uploaded' });
    if (!String(req.file.mimetype || '').startsWith('image/')) {
      return res.status(400).json({ message: 'Logo must be an image file' });
    }

    const safeBase = sanitizeBaseName(req.file.originalname || 'channel-logo');
    const logoPath = `channel-logos/user-${req.user._id}/${Date.now()}-${safeBase}`;
    const { error } = await supabase.storage.from('uploads').upload(logoPath, req.file.buffer, {
      contentType: req.file.mimetype,
    });

    if (error) return res.status(500).json({ message: error.message });

    const { data } = supabase.storage.from('uploads').getPublicUrl(logoPath);
    req.user.channelLogoUrl = data.publicUrl;
    await req.user.save();

    return res.json({
      message: 'Channel logo updated',
      channel: {
        id: String(req.user._id),
        name: req.user.name || 'My Channel',
        handle: req.user.channelHandle || '',
        logoUrl: req.user.channelLogoUrl || '',
        url: buildChannelUrl(req.user.channelHandle || '', String(req.user._id)),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update channel logo' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const visibility = req.body.visibility === 'public' ? 'public' : 'private';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const rawCategory = typeof req.body.category === 'string' ? req.body.category.trim().toLowerCase() : '';
    const category = ALLOWED_CONTENT_CATEGORIES.has(rawCategory) ? rawCategory : '';
    const filePath = `user-${req.user._id}/${Date.now()}-${req.file.originalname}`;
    const { error } = await supabase.storage.from('uploads').upload(filePath, req.file.buffer, { contentType: req.file.mimetype });
    if (error) return res.status(500).json({ message: error.message });
    const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
    req.user.files.push({ url: data.publicUrl, visibility, description, category });
    await req.user.save();
    res.json({ message: 'File uploaded', file: { url: data.publicUrl, visibility, description, category } });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
};


exports.deleteFile = async (req, res) => {
  try {
    if (!req.body.fileUrl) return res.status(400).json({ message: 'File URL required' });
    const filePath = req.body.fileUrl.split('/storage/v1/object/public/uploads/')[1];
    if (!filePath) return res.status(400).json({ message: 'Invalid file URL' });
    const { error } = await supabase.storage.from('uploads').remove([filePath]);
    if (error) return res.status(500).json({ message: error.message });
    req.user.files = req.user.files.filter((entry) => {
      const normalized = normalizeFileEntry(entry);
      return !normalized || normalized.url !== req.body.fileUrl;
    });
    await req.user.save();
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

exports.convertFile = async (req, res) => {
  let tempDir = '';
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const targetFormat = String(req.body.targetFormat || '').toLowerCase().trim();
    if (!targetFormat) return res.status(400).json({ message: 'targetFormat is required' });
    if (!ALLOWED_TARGET_FORMATS.has(targetFormat)) {
      return res.status(400).json({ message: 'Unsupported target format' });
    }

    await ensureConvertedDir();
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'webnote-convert-'));

    const originalExt = path.extname(req.file.originalname || '');
    const safeBase = sanitizeBaseName(req.file.originalname);
    const inputFilename = `${Date.now()}-${safeBase}${originalExt}`;
    const inputPath = path.join(tempDir, inputFilename);
    await fs.promises.writeFile(inputPath, req.file.buffer);

    await runLibreOfficeConvert(inputPath, tempDir, targetFormat);

    const inputBase = path.parse(inputFilename).name.toLowerCase();
    const expectedSuffix = `.${targetFormat}`;
    const tempFiles = await fs.promises.readdir(tempDir);
    const convertedName = tempFiles.find((name) => {
      const lower = name.toLowerCase();
      return lower.startsWith(inputBase) && lower.endsWith(expectedSuffix);
    });

    if (!convertedName) {
      return res.status(500).json({ message: 'Conversion failed: output file not found' });
    }

    const finalName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${targetFormat}`;
    const finalPath = path.join(CONVERTED_DIR, finalName);
    await fs.promises.copyFile(path.join(tempDir, convertedName), finalPath);

    cleanupOldConvertedFiles();

    return res.json({
      message: 'File converted successfully',
      convertedFile: {
        filename: finalName,
        format: targetFormat,
        url: `${req.protocol}://${req.get('host')}/converted/${encodeURIComponent(finalName)}`,
      },
    });
  } catch (err) {
    const notInstalled = err && (err.code === 'ENOENT' || String(err.message || '').includes('not available'));
    if (notInstalled) {
      return res.status(500).json({
        message: 'LibreOffice not found. Install LibreOffice or set LIBREOFFICE_PATH in backend/.env',
      });
    }
    return res.status(500).json({ message: 'Conversion failed' });
  } finally {
    if (tempDir) {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
  }
};
