require "test_helper"

class RecipesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @recipe = recipes(:japchae)
    sign_in_as(@user)
  end

  # Authentication tests
  test "redirects to login when not authenticated" do
    sign_out
    get recipes_url
    assert_redirected_to new_session_url
  end

  test "cannot access other users recipes" do
    other_recipe = recipes(:other_user_recipe)
    sign_out
    sign_in_as(users(:two))

    get recipe_url(@recipe)
    assert_response :not_found
  end

  # Index tests
  test "should get index" do
    get recipes_url
    assert_response :success
    assert_select "h2", "Recipes"
  end

  test "index shows only current users recipes" do
    get recipes_url
    assert_select ".recipe-list li", count: 3 # japchae, pancakes, no_ingredients
    assert_select ".card-title", text: "Secret Recipe", count: 0
  end

  test "index can filter by tag" do
    # Create a tag for the recipe
    @recipe.tags << Tag.find_or_create_by(name: "korean")

    get recipes_url(tag: "korean")
    assert_response :success
    assert_select ".card-title", "Japchae"
  end

  # Show tests
  test "should get show" do
    get recipe_url(@recipe)
    assert_response :success
    assert_select "h2", @recipe.title
  end

  test "show displays cooking history" do
    get recipe_url(@recipe)
    assert_select ".cooking-history-card"
    assert_select ".cooking-count"
  end

  # New tests
  test "should get new" do
    get new_recipe_url
    assert_response :success
    assert_select "form"
  end

  # Create tests
  test "should create recipe" do
    assert_difference("Recipe.count") do
      post recipes_url, params: {
        recipe: { title: "New Recipe", ingredients: "Ingredient 1", instructions: "Step 1" }
      }
    end

    assert_redirected_to recipe_url(Recipe.last)
    assert_equal @user.id, Recipe.last.user_id
  end

  test "should create recipe with tags" do
    assert_difference("Recipe.count") do
      post recipes_url, params: {
        recipe: { title: "Tagged Recipe", ingredients: "Stuff", instructions: "Do it" },
        tag_list: "lunch, healthy"
      }
    end

    recipe = Recipe.last
    assert_equal 2, recipe.tags.count
    assert_includes recipe.tags.pluck(:name), "lunch"
    assert_includes recipe.tags.pluck(:name), "healthy"
  end

  # Edit tests
  test "should get edit" do
    get edit_recipe_url(@recipe)
    assert_response :success
    assert_select "form"
  end

  # Update tests
  test "should update recipe" do
    patch recipe_url(@recipe), params: {
      recipe: { title: "Updated Title" }
    }
    assert_redirected_to recipe_url(@recipe)
    @recipe.reload
    assert_equal "Updated Title", @recipe.title
  end

  test "should update recipe tags" do
    patch recipe_url(@recipe), params: {
      recipe: { title: @recipe.title },
      tag_list: "new-tag, another-tag"
    }

    @recipe.reload
    assert_equal 2, @recipe.tags.count
    assert_includes @recipe.tags.pluck(:name), "new-tag"
  end

  test "clearing tags removes all tags" do
    @recipe.tags << Tag.find_or_create_by(name: "test")
    patch recipe_url(@recipe), params: {
      recipe: { title: @recipe.title },
      tag_list: ""
    }

    @recipe.reload
    assert_equal 0, @recipe.tags.count
  end

  # Destroy tests
  test "should destroy recipe" do
    assert_difference("Recipe.count", -1) do
      delete recipe_url(@recipe)
    end

    assert_redirected_to recipes_url
  end

  test "destroying recipe also destroys cooking logs" do
    @recipe.cooking_logs.create!(cooked_at: Date.current)
    cooking_log_count = @recipe.cooking_logs.count

    assert_difference("CookingLog.count", -cooking_log_count) do
      delete recipe_url(@recipe)
    end
  end
end
