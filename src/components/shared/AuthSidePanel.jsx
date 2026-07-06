export default function AuthSidePanel({ image, imageAlt = '', width = 'half', children }) {
  const widthClass = width === 'narrow' ? 'lg:w-2/5' : 'lg:w-1/2'

  return (
    <div className={`hidden lg:flex ${widthClass} relative overflow-hidden items-center justify-center p-12`}>
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('${image}')` }}
        role="img"
        aria-label={imageAlt}
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950/40 via-transparent to-gray-900/30" />
      <div className="relative z-10 text-white max-w-md w-full">
        {children}
      </div>
    </div>
  )
}
