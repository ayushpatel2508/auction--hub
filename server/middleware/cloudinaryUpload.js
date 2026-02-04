import multer from 'multer'
import cloudinary from '../config/cloudinary.js'
import { Readable } from 'stream'

// Configure multer to store files in memory
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only images are allowed!'), false)
  }
}

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
})

// Function to upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'auction-images',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    // Convert buffer to stream and pipe to Cloudinary
    const stream = Readable.from(buffer)
    stream.pipe(uploadStream)
  })
}

// Function to delete image from Cloudinary
export const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId)
}