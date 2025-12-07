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
end
