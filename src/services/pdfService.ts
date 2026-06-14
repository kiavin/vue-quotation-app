export const pdfService = {
  /**
   * Print the current document
   */
  print() {
    window.print()
  },

  /**
   * Export as PDF (Browser default)
   */
  exportPDF() {
    window.print()
  },

  /**
   * Share functionality (Placeholder)
   */
  share(url: string, title: string) {
    if (navigator.share) {
      navigator.share({
        title,
        url
      }).catch(console.error)
    } else {
      // Fallback
      window.prompt('Copy link to share:', url)
    }
  }
}
