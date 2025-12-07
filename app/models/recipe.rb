class Recipe < ApplicationRecord
  has_many :cooking_logs, dependent: :destroy
  has_many :recipe_tags, dependent: :destroy
  has_many :tags, through: :recipe_tags
end
