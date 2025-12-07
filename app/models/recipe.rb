class Recipe < ApplicationRecord
  has_many :cooking_logs, dependent: :destroy
end
