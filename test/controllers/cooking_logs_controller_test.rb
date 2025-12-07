require "test_helper"

class CookingLogsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @recipe = recipes(:japchae)
    @cooking_log = cooking_logs(:japchae_yesterday)
  end

  test "should create cooking log for today" do
    assert_difference("CookingLog.count") do
      post recipe_cooking_logs_url(@recipe)
    end

    assert_redirected_to recipe_url(@recipe)
    assert_equal Date.current, CookingLog.last.cooked_at
  end

  test "should create cooking log with specific date" do
    specific_date = 3.days.ago.to_date

    assert_difference("CookingLog.count") do
      post recipe_cooking_logs_url(@recipe), params: { cooked_at: specific_date }
    end

    assert_redirected_to recipe_url(@recipe)
    assert_equal specific_date, CookingLog.last.cooked_at
  end

  test "should destroy cooking log" do
    assert_difference("CookingLog.count", -1) do
      delete recipe_cooking_log_url(@recipe, @cooking_log)
    end

    assert_redirected_to recipe_url(@recipe)
  end

  test "destroying cooking log does not destroy recipe" do
    assert_no_difference("Recipe.count") do
      delete recipe_cooking_log_url(@recipe, @cooking_log)
    end
  end

  test "create redirects with notice" do
    post recipe_cooking_logs_url(@recipe)
    assert_redirected_to recipe_url(@recipe)
    follow_redirect!
    assert_select ".flash-notice"
  end

  test "destroy redirects with notice" do
    delete recipe_cooking_log_url(@recipe, @cooking_log)
    assert_redirected_to recipe_url(@recipe)
    follow_redirect!
    assert_select ".flash-notice"
  end
end

