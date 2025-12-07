class OmniauthCallbacksController < ApplicationController
  allow_unauthenticated_access only: [:google_oauth2, :failure]

  def google_oauth2
    auth = request.env["omniauth.auth"]
    @user = User.from_omniauth(auth)

    if @user.persisted?
      start_new_session_for @user
      redirect_to root_path, notice: "Successfully signed in with Google!"
    else
      redirect_to new_session_path, alert: "Could not authenticate with Google. Please try again."
    end
  end

  def failure
    redirect_to new_session_path, alert: "Authentication failed: #{params[:message]&.humanize}"
  end
end

