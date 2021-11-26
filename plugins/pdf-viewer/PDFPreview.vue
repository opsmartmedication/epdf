<template>
  <div id="pdf-preview">
    <div id="preview-container"></div>
  </div>
</template>

<script>
export default {
  beforeDestroy() {
    // delete all childs as a precaution to keep DOM clean
    this.deleteChilds();
  },
  created() {
    let matchMediaList = [
      window.matchMedia("(max-width: 1540px)"),
      window.matchMedia("(max-width: 1100px)"),
      window.matchMedia("(max-width: 1080px)")
    ];
    matchMediaList[0].addEventListener("change", this.windowChange);
    matchMediaList[1].addEventListener("change", this.windowChange);
    matchMediaList[2].addEventListener("change", this.windowChange);

    matchMediaList.forEach((e) => {
      if (e.matches) {
        //this.windowChange(e);
      }
    });
  },
  props: {
    pdfFile: null,
    showAll: Boolean
  },
  data() {
    return {
      zoom: 0.3
    };
  },
  watch: {
    pdfFile(newPdf, oldPdf) {
      if (newPdf != oldPdf) {
        if (oldPdf != null) {
          //oldPdf.cleanup();
          //oldPdf.destroy();
        }
        this.deleteChilds();
        this.renderPreview();
      }
    },
    zoom(newValue, oldValue) {
      if (this.pdfFile != null) {
        this.deleteChilds();
        this.renderPreview();
      }
    }
  },
  methods: {
    /**
     * Renders all pages for the preview
     */
    renderPreview() {
      for (let i = 1; i <= this.pdfFile.numPages; i++) {
        let self = this;
        this.pdfFile.getPage(i).then(function (page) {
          const container = document.getElementById("preview-container");
          if (container.children[i - 1] == undefined) {
            self.createCanvas(i);
          }
          let onscreen_canvas = container.children[i - 1].firstElementChild;
          let canvas_wrapper = container.children[i - 1];

          let offscreen_canvas = document.createElement("canvas");

          let offscreen_context = offscreen_canvas.getContext("2d");
          let scale = 4;
          let viewport = page.getViewport({ scale: scale });
          offscreen_canvas.height = viewport.height * self.zoom;
          offscreen_canvas.width = viewport.width * self.zoom;
          offscreen_canvas.style.height =
            ((viewport.height * 1.5) / scale) * self.zoom + "px";
          offscreen_canvas.style.width =
            ((viewport.width * 1.5) / scale) * self.zoom + "px";

          canvas_wrapper.style.height = offscreen_canvas.style.height;
          canvas_wrapper.style.width = offscreen_canvas.style.width;
          canvas_wrapper.style.margin = "0 0 1rem 0";

          // Render PDF page into canvas context
          let renderContext = {
            canvasContext: offscreen_context,
            viewport: viewport,
            transform: [self.zoom, 0, 0, self.zoom, 0, 0]
          };
          self.render(i, page, renderContext, onscreen_canvas, offscreen_canvas, viewport, scale);
          
        });
      }
    },

    render(i, page, renderContext, onscreen_canvas, offscreen_canvas, viewport, scale) {
      let self = this;
      page
      .render(renderContext)
      .promise.then(() => {
        let context = onscreen_canvas.getContext("2d");
        context.save();

        onscreen_canvas.height = viewport.height * self.zoom;
        onscreen_canvas.width = viewport.width * self.zoom;
        onscreen_canvas.style.height =
          ((viewport.height * 1.5) / scale) * self.zoom + "px";
        onscreen_canvas.style.width =
          ((viewport.width * 1.5) / scale) * self.zoom + "px";
        context.globalCompositeOperation = "copy";
        context.drawImage(offscreen_canvas, 0, 0);
        context.restore();
        offscreen_canvas.remove();
        page.cleanup();
        if (self.pdfFile.numPages == i) {
          self.$nuxt.$emit("preview-render-finished");
        }
      })
      .catch((error) => {
        
        console.log(error);
      });
    },

    /**
     * Deletes all childs of the canvas preview-container
     */
    deleteChilds() {
      let container = document.getElementById("preview-container");
      let child = container.lastElementChild;
      while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
      }
    },

    /**
     * Creates an onscreen canvas for each page of the pdf
     */
    createCanvas(page_number) {
      let container = document.getElementById("preview-container");
      for (let i = 0; i < page_number; i++) {
        if (container.children[i] == undefined) {
          let canvas = document.createElement("canvas");
          canvas.addEventListener("click", (e) => {
            document.getElementById("page-" + (i + 1)).scrollIntoView();
          });
          canvas.classList.add("canvas");
          canvas.id = "preview" + (i + 1);
          let canvas_wrapper = document.createElement("div");
          canvas_wrapper.id = "preview-page-" + (i + 1);
          canvas_wrapper.style.position = "relative";
          canvas_wrapper.appendChild(canvas);
          container.appendChild(canvas_wrapper);
        }
      }
    },

    /**
     * Creates a buffer out of the base64 string
     *
     * @param Event x
     * The change event of the media query
     */
    windowChange(x) {
      if (x.media == "(max-width: 1080px)") {
        if (x.matches) {
          this.zoom = 0.3;
        } else {
          this.zoom = 0.3;
        }
      } else if (x.media == "(max-width: 1100px)") {
        if (x.matches) {
          this.zoom = 0.3;
        } else {
          this.zoom = 0.3;
        }
      } else if (x.media == "(max-width: 1540px)") {
        if (x.matches) {
          this.zoom = 0.3;
        } else {
          this.zoom = 0.3;
        }
      }
    }
  }
};
</script>

<style scoped>
/* .preview-container {
  padding: 0;
}
.pdf-preview {
  padding: 0;
} */
</style>
