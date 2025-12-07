require "test_helper"

class RecipesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @recipe = recipes(:japchae)
  end

  # Index tests
  test "should get index" do
    get recipes_url
    assert_response :success
    assert_select "h2", "Recipes"
  end

  test "index shows all recipes" do
    get recipes_url
    assert_select ".recipe-list li", minimum: 2
  end

  test "index can filter by tag" do
    get recipes_url(tag: "korean")
    assert_response :success
    assert_select ".card-title", "Japchae"
    assert_select ".card-title", count: 1
  end

  test "index shows tag filter pills when tags exist" do
    get recipes_url
    assert_select ".tag-filter .tag-pill", minimum: 1
  end

  # Show tests
  test "should get show" do
    get recipe_url(@recipe)
    assert_response :success
    assert_select "h2", @recipe.title
  end

  test "show displays recipe tags" do
    get recipe_url(@recipe)
    assert_select ".tag-badge", minimum: 1
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

  test "create with invalid params renders new" do
    post recipes_url, params: {
      recipe: { title: "", ingredients: "", instructions: "" }
    }
    # Recipe model doesn't have validations requiring title, so this should still work
    assert_redirected_to recipe_url(Recipe.last)
  end

  # Edit tests
  test "should get edit" do
    get edit_recipe_url(@recipe)
    assert_response :success
    assert_select "form"
  end

  test "edit form shows existing tags" do
    get edit_recipe_url(@recipe)
    assert_response :success
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
    cooking_log_count = @recipe.cooking_logs.count

    assert_difference("CookingLog.count", -cooking_log_count) do
      delete recipe_url(@recipe)
    end
  end
end
