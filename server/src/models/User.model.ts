import mongoose, { Document, Schema } from 'mongoose'

export type UserRole = 'user' | 'admin' | 'super_admin'

export type AuthProvider = 'local' | 'google' | 'facebook'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash?: string
  googleId?: string
  facebookId?: string
  authProviders: AuthProvider[]
  role: UserRole
  is_admin: boolean
  is_super_admin: boolean
  avatar?: string
  subscription: {
    status: 'free' | 'premium'
    plan?: string | null
    startedAt?: Date
    expiresAt?: Date
  }
  preferences: {
    genres: string[]
    languages: string[]
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, index: true },
    facebookId: { type: String, unique: true, sparse: true, index: true },
    authProviders: {
      type: [String],
      enum: ['local', 'google', 'facebook'],
      default: [],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },
    is_admin: { type: Boolean, default: false },
    is_super_admin: { type: Boolean, default: false },
    avatar: { type: String },
    subscription: {
      status: { type: String, enum: ['free', 'premium'], default: 'free' },
      plan: { type: String, default: null },
      startedAt: { type: Date },
      expiresAt: { type: Date },
    },
    preferences: {
      genres: { type: [String], default: [] },
      languages: { type: [String], default: [] },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

UserSchema.pre('validate', function requireAuthMethod() {
  const hasGoogle = Boolean(this.googleId)
  const hasFacebook = Boolean(this.facebookId)
  if (!hasGoogle && !hasFacebook) {
    this.invalidate('googleId', 'Account must use Google or Facebook sign-in')
  }
})

UserSchema.pre('save', function syncAdminFlags() {
  if (this.is_super_admin) {
    this.is_admin = true
    this.role = 'super_admin'
  } else if (this.is_admin || this.role === 'admin') {
    this.is_admin = true
    this.role = 'admin'
    this.is_super_admin = false
  } else {
    this.role = 'user'
    this.is_admin = false
    this.is_super_admin = false
  }
})

export const User = mongoose.model<IUser>('User', UserSchema)

export function sanitizeUser(user: IUser | Record<string, unknown>) {
  const obj = typeof (user as IUser).toObject === 'function'
    ? (user as IUser).toObject()
    : { ...user }
  delete (obj as Record<string, unknown>).passwordHash
  return obj
}
