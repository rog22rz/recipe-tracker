require "test_helper"

class CookingLogTest < ActiveSupport::TestCase
  test "cooking log belongs to a recipe" do
    log = cooking_logs(:japchae_yesterday)
    assert_equal recipes(:japchae), log.recipe
  end

  test "cooking log requires a recipe" do
    log = CookingLog.new(cooked_at: Date.current)
    assert_not log.valid?
    assert_includes log.errors[:recipe], "must exist"
  end

  test "cooking log can be created with a date" do
    recipe = recipes(:japchae)
    log = CookingLog.new(recipe: recipe, cooked_at: Date.current)
    assert log.valid?
    assert log.save
  end

  test "multiple cooking logs can have the same date for the same recipe" do
    recipe = recipes(:japchae)
    log1 = CookingLog.create!(recipe: recipe, cooked_at: Date.current)
    log2 = CookingLog.new(recipe: recipe, cooked_at: Date.current)
    assert log2.valid?
  end
end
