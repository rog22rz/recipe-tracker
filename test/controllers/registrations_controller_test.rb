require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get new_registration_url
    assert_response :success
    assert_select ".auth-title", "Create your account"
  end

  test "should create user and sign in" do
    assert_difference("User.count") do
      post registration_url, params: {
        user: {
          email_address: "newuser@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    assert_redirected_to root_path
    follow_redirect!
    assert_select ".nav-user", "newuser@example.com"
  end

  test "should not create user with mismatched passwords" do
    assert_no_difference("User.count") do
      post registration_url, params: {
        user: {
          email_address: "newuser@example.com",
          password: "password123",
          password_confirmation: "different"
        }
      }
    end

    assert_response :unprocessable_entity
    assert_select ".auth-errors"
  end

  test "should not create user with duplicate email" do
    existing_user = users(:one)

    assert_no_difference("User.count") do
      post registration_url, params: {
        user: {
          email_address: existing_user.email_address,
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    assert_response :unprocessable_entity
  end

  test "should not create user with short password" do
    assert_no_difference("User.count") do
      post registration_url, params: {
        user: {
          email_address: "newuser@example.com",
          password: "short",
          password_confirmation: "short"
        }
      }
    end

    assert_response :unprocessable_entity
  end
end

