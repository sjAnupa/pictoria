import { Link } from 'react-router-dom'

type AuthAlertProps = {
  message: string
  variant?: 'error' | 'info'
  action?: { label: string; to: string }
}

export default function AuthAlert({ message, variant = 'error', action }: AuthAlertProps) {
  const isError = variant === 'error'
  const textClass = isError ? 'text-[#8B2635]' : 'text-[#6B4226]'

  return (
    <div
      className={`rounded-lg px-3.5 py-3 text-sm leading-relaxed ${
        isError
          ? 'border border-[#E8C98A] bg-[#FDF0D5]'
          : 'border border-[#E8C98A]/90 bg-[#FDF0D5]/80'
      } ${textClass}`}
      role="status"
    >
      <p className="m-0">
        <span className="font-medium">{message}</span>
        {action ? (
          <>
            {' '}
            <Link
              to={action.to}
              className="font-bold text-[#8B2635] no-underline underline-offset-2 hover:underline"
            >
              {action.label}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  )
}
