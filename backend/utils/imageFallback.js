const doctorPlaceholderSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" rx="32" fill="#E8F0FF"/>
  <circle cx="200" cy="150" r="70" fill="#A8BCEB"/>
  <path d="M95 327c18-55 60-83 105-83s87 28 105 83" fill="#A8BCEB"/>
</svg>
`.trim()

const toDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

export const doctorPlaceholderImage = toDataUri(doctorPlaceholderSvg)

export const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_SECRET_KEY
  )
