import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["overlay"]

  open() {
    this.overlayTarget.hidden = false
    document.body.style.overflow = "hidden"
  }

  close() {
    this.overlayTarget.hidden = true
    document.body.style.overflow = ""
  }

  closeBackground(event) {
    if (event.target === this.overlayTarget) {
      this.close()
    }
  }
}

