class User < ApplicationRecord
  has_secure_password validations: false
  has_many :sessions, dependent: :destroy
  has_many :recipes, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true, uniqueness: true
  validates :password, presence: true, length: { minimum: 6 }, if: :password_required?
  validates :password, confirmation: true, if: -> { password.present? }
  validates :password_confirmation, presence: true, if: -> { password.present? && new_record? && !oauth_user? }

  # Find or create a user from Google OAuth data
  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_initialize.tap do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.email_address = auth.info.email
      user.name = auth.info.name
      user.avatar_url = auth.info.image
      # Generate a random password for OAuth users (they won't use it)
      if user.new_record?
        random_password = SecureRandom.hex(16)
        user.password = random_password
        user.password_confirmation = random_password
      end
      user.save!
    end
  end

  # Check if this user signed up with OAuth
  def oauth_user?
    provider.present? && uid.present?
  end

  private

  def password_required?
    # Password is required for new records without OAuth, or when explicitly changing password
    return false if oauth_user?
    new_record? || password.present?
  end
end
