require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "downcases and strips email_address" do
    user = User.new(email_address: " DOWNCASED@EXAMPLE.COM ")
    assert_equal("downcased@example.com", user.email_address)
  end

  test "user has many recipes" do
    user = users(:one)
    assert user.recipes.count >= 1
  end

  test "destroying user destroys associated recipes" do
    user = users(:one)
    recipe_count = user.recipes.count

    assert_difference "Recipe.count", -recipe_count do
      user.destroy
    end
  end

  test "user has many sessions" do
    user = users(:one)
    user.sessions.create!
    assert user.sessions.count >= 1
  end

  # OAuth Tests
  test "from_omniauth creates new user from google auth" do
    auth = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "123456789",
      info: {
        email: "oauth_user@example.com",
        name: "OAuth User",
        image: "https://example.com/avatar.jpg"
      }
    })

    assert_difference "User.count", 1 do
      user = User.from_omniauth(auth)
      assert user.persisted?
      assert_equal "google_oauth2", user.provider
      assert_equal "123456789", user.uid
      assert_equal "oauth_user@example.com", user.email_address
      assert_equal "OAuth User", user.name
      assert_equal "https://example.com/avatar.jpg", user.avatar_url
    end
  end

  test "from_omniauth finds existing user by provider and uid" do
    auth = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "existing_uid_123",
      info: {
        email: "existing_oauth@example.com",
        name: "Existing OAuth User",
        image: "https://example.com/avatar.jpg"
      }
    })

    # Create the user first
    User.from_omniauth(auth)

    # Should find existing user, not create new one
    assert_no_difference "User.count" do
      user = User.from_omniauth(auth)
      assert user.persisted?
      assert_equal "google_oauth2", user.provider
    end
  end

  test "from_omniauth updates existing user info" do
    auth = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "update_test_uid",
      info: {
        email: "update_test@example.com",
        name: "Original Name",
        image: "https://example.com/old_avatar.jpg"
      }
    })

    user = User.from_omniauth(auth)

    # Update with new info
    auth.info.name = "Updated Name"
    auth.info.image = "https://example.com/new_avatar.jpg"

    updated_user = User.from_omniauth(auth)
    assert_equal user.id, updated_user.id
    assert_equal "Updated Name", updated_user.name
    assert_equal "https://example.com/new_avatar.jpg", updated_user.avatar_url
  end

  test "oauth_user? returns true for OAuth users" do
    user = User.new(provider: "google_oauth2", uid: "123456")
    assert user.oauth_user?
  end

  test "oauth_user? returns false for regular users" do
    user = users(:one)
    assert_not user.oauth_user?
  end

  test "OAuth user does not require password" do
    auth = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "no_password_test",
      info: {
        email: "no_password@example.com",
        name: "No Password User",
        image: nil
      }
    })

    user = User.from_omniauth(auth)
    assert user.valid?
    assert user.persisted?
  end

  test "regular user requires password" do
    user = User.new(email_address: "needspassword@example.com")
    assert_not user.valid?
    assert_includes user.errors[:password], "can't be blank"
  end

  test "regular user requires password confirmation" do
    user = User.new(
      email_address: "needsconfirmation@example.com",
      password: "password123"
    )
    assert_not user.valid?
    assert_includes user.errors[:password_confirmation], "can't be blank"
  end

  test "regular user password must match confirmation" do
    user = User.new(
      email_address: "mismatch@example.com",
      password: "password123",
      password_confirmation: "different"
    )
    assert_not user.valid?
    assert_includes user.errors[:password_confirmation], "doesn't match Password"
  end

  test "password minimum length is 6 characters" do
    user = User.new(
      email_address: "short@example.com",
      password: "short",
      password_confirmation: "short"
    )
    assert_not user.valid?
    assert user.errors[:password].any? { |e| e.include?("too short") }
  end

  test "email uniqueness is enforced" do
    existing = users(:one)
    user = User.new(
      email_address: existing.email_address,
      password: "password123",
      password_confirmation: "password123"
    )
    assert_not user.valid?
    assert_includes user.errors[:email_address], "has already been taken"
  end
end
