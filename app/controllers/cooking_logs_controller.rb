class CookingLogsController < ApplicationController
  before_action :set_recipe

  def create
    cooked_date = params[:cooked_at].present? ? params[:cooked_at] : Date.current
    @cooking_log = @recipe.cooking_logs.build(cooked_at: cooked_date)
    if @cooking_log.save
      redirect_to @recipe, notice: "Logged cooking for #{@cooking_log.cooked_at.strftime('%B %d, %Y')}!"
    else
      redirect_to @recipe, alert: "Could not log cooking."
    end
  end

  def destroy
    @cooking_log = @recipe.cooking_logs.find(params[:id])
    @cooking_log.destroy
    redirect_to @recipe, notice: "Cooking log removed."
  end

  private

  def set_recipe
    @recipe = Recipe.find(params[:recipe_id])
  end
end

