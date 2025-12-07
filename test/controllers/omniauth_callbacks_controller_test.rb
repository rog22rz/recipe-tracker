require "test_helper"

class OmniauthCallbacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    OmniAuth.config.test_mode = true
  end

  teardown do
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end

  test "successful google oauth creates user and signs in" do
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "new_google_user_123",
      info: {
        email: "newgoogleuser@example.com",
        name: "New Google User",
        image: "https://example.com/avatar.jpg"
      }
    })

    assert_difference "User.count", 1 do
      get "/auth/google_oauth2/callback"
    end

    assert_redirected_to root_path
    follow_redirect!

    # User should be signed in
    assert_select ".nav-user", "newgoogleuser@example.com"
  end

  test "successful google oauth finds existing user and signs in" do
    # Create existing OAuth user
    random_password = SecureRandom.hex(16)
    existing_user = User.create!(
      email_address: "existingoauth@example.com",
      provider: "google_oauth2",
      uid: "existing_uid_456",
      name: "Existing User",
      password: random_password,
      password_confirmation: random_password
    )

    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "existing_uid_456",
      info: {
        email: "existingoauth@example.com",
        name: "Existing User",
        image: "https://example.com/avatar.jpg"
      }
    })

    assert_no_difference "User.count" do
      get "/auth/google_oauth2/callback"
    end

    assert_redirected_to root_path
  end

  test "oauth failure redirects to login with error message" do
    OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials

    get "/auth/google_oauth2/callback"
    assert_redirected_to "/auth/failure?message=invalid_credentials&strategy=google_oauth2"
  end

  test "failure action redirects to login page" do
    get "/auth/failure", params: { message: "access_denied" }
    assert_redirected_to new_session_path
    follow_redirect!
    assert_select ".auth-errors"
  end

  test "oauth does not require authentication" do
    # Should not redirect to login
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "unauth_test_123",
      info: {
        email: "unauth_test@example.com",
        name: "Unauth Test",
        image: nil
      }
    })

    get "/auth/google_oauth2/callback"
    assert_redirected_to root_path # Not new_session_path
  end
end

