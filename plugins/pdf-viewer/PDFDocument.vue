<template>

  <div class="wrapper col-12 " >
    <div class="container " >
      <div id="container"></div>
    </div>
  </div>
</template>

<script>
import pdfTools from "~/mixins/pdfTools.js";
export default {
  mixins: [pdfTools],
  beforeDestroy() {
    this.deleteChilds();
  },
  props: {
    pdfFile: null,
    jumpPageIndex: {
      type: Number
    },
    editable: {
      type: Boolean
    }
  },
  data() {
    return {
      showAll: true,
      zoom: 0.7,
      currentPageIndex: 1
    };
  },
  computed: {
    pageCount() {
      if (this.pdfFile != null) {
        return this.pdfFile.numPages;
      } else {
        return 0;
      }
    }
  },
  watch: {
    pdfFile(newPdf, oldPdf) {
      if (newPdf != oldPdf) {
        if (oldPdf != null) {
        }
        this.renderPDF();
      }
    },
    jumpPageIndex(newValue, oldValue) {
      if (newValue != oldValue && newValue != null) {
        if (this.showAll) {
          document.getElementById("page-" + newValue).scrollIntoView();
        } else {
          this.currentPageIndex = newValue;
          this.renderPage(this.currentPageIndex);
        }
      }
      this.$emit("page-index-null-event");
    },
    zoom(newValue, oldValue) {
       if (newValue != oldValue) {
         this.$nuxt.$emit("reload-pdf");
      }
    }
  },
  created() {
    let matchMediaList = [
    
      window.matchMedia("(max-width: 1080px)"),
      window.matchMedia("(max-width: 360px)")
    ];
    matchMediaList[0].addEventListener("change", this.windowChange);
     matchMediaList[1].addEventListener("change", this.windowChange);
    matchMediaList.forEach((e) => {
      if (e.matches) {
        this.windowChange(e);
      }
    });
  },
  methods: {
   
    /**
     * Initializes the render process
     */
    renderPDF() {
      if (this.showAll) {
        for (let i = 1; i <= this.pdfFile.numPages; i++) {
          this.renderPage(i);
        }
      } else {
        this.renderPage(this.currentPageIndex);
      }
    },
    /**
     * Renders a single page based on the page index
     *
     * @param Int pageNum
     *   The index of the page to be rendered
     */
    renderPage(pageNum) {
      let page_number = pageNum;
      const self = this;
      this.pdfFile.getPage(page_number).then(function (page) {
        const container = document.getElementById("container");
        if (container.children[page_number - 1] == undefined) {
          self.createCanvas(page_number);
        }
        let onscreen_canvas =
          container.children[page_number - 1].firstElementChild;
        let offscreen_canvas = document.createElement("canvas");
        let scale = 3.2 / self.zoom;
        let viewport = page.getViewport({ scale: scale });
        // offscreen canvas init
        offscreen_canvas.height = viewport.height * self.zoom;
        offscreen_canvas.width = viewport.width * self.zoom;
        offscreen_canvas.style.height =
          ((viewport.height * 1.5) / scale) * self.zoom + "px";
        offscreen_canvas.style.width =
          ((viewport.width * 1.5) / scale) * self.zoom + "px";
        let context = offscreen_canvas.getContext("2d");
        let render_context = {
          canvasContext: context,
          viewport: viewport,
          transform: [self.zoom, 0, 0, self.zoom, 0, 0]
        };
         self.render(page_number, page, render_context, onscreen_canvas, offscreen_canvas, viewport, scale);
        
      });
    },
    render(page_number, page, render_context, onscreen_canvas, offscreen_canvas, viewport, scale) {
      let self = this;
      page
      .render(render_context)
      .promise.then(() => {
        let context = onscreen_canvas.getContext("2d");
        context.save();
        // onscreen canvas dimension init
        onscreen_canvas.height = viewport.height * self.zoom;
        onscreen_canvas.width = viewport.width * self.zoom;
        onscreen_canvas.style.height =
          ((viewport.height * 1.5) / scale) * self.zoom + "px";
        onscreen_canvas.style.width =
          ((viewport.width * 1.5) / scale) * self.zoom + "px";
        context.globalCompositeOperation = "copy";
        context.drawImage(offscreen_canvas, 0, 0);
        context.restore();
        page.cleanup();
        offscreen_canvas.remove();
        if (self.pdfFile.numPages == page_number) {
          self.$nuxt.$emit("render-finished");
        }
      })
      .catch((error) => {
        
        console.log(error);
      });
    },
    /**
     * Deletes all childs of the canvas container
     */
    deleteChilds() {
      let container = document.getElementById("container");
      let child = container.lastElementChild;
      while (child) {
        try {
          child.firstElementChild.removeEventListener(
            "click",
            function (event) {
              self.canvasClicked(event);
            }
          );
        } catch (error) {}
        container.removeChild(child);
        child = container.lastElementChild;
      }
    },
    /**
     * Creates an onscreen canvas for each page of the pdf
     */
    createCanvas() {
      let container = document.getElementById("container");
      let numPages = this.pdfFile.numPages;
      for (let i = 0; i < numPages; i++) {
        if (container.children[i] == undefined) {
          let canvas = document.createElement("canvas");
          canvas.classList.add("canvas");
          canvas.id = i + 1;
          let canvas_wrapper = document.createElement("div");
          canvas_wrapper.className = "canvas-wrapper";
          canvas_wrapper.id = "page-" + (i + 1);
          canvas.classList.add("custom_canvas-shadow");
          canvas_wrapper.style.position = "relative";
          canvas.style.border = "1px solid black";
          
          canvas_wrapper.appendChild(canvas);
          container.appendChild(canvas_wrapper);
        }
      }
    },
    /**
     * Used for single page show: changes the current page to page with index n
     * @param Int n
     * The index of the page
     */
    changePage(n) {
      try {
        if (n) {
          if (this.currentPageIndex < this.pdfFile.numPages) {
            this.currentPageIndex++;
          }
        } else {
          if (this.currentPageIndex > 1) {
            this.currentPageIndex--;
          }
        }
        this.renderPage(this.currentPageIndex);
      } catch (error) {}
    },
    /**
     * Creates a buffer out of the base64 string
     *
     * @param Event x
     * The change event of the media query
     */
    windowChange(x) {
      if (x.media == "(max-width: 360px)") {
        if (x.matches) {
          this.zoom = 0.7;
        } else {
          this.zoom = 0.7;
        }
      } else if (x.media == "(max-width: 1100px)") {
        if (x.matches) {
          this.zoom = 0.7;
        } else {
          this.zoom = 0.7;
        }
      }
    }
  }
};
</script>

<style scoped>
.button-wrapper {
  width: 300px;
  height: 48px;
  position: fixed;
  top: 4.6rem;
  right: -6rem;
  z-index: 10;
}
.button-container {
  position: fixed;
}
.btn {
  color: black;
  background: white;
  border: 1px solid black;
  margin: 5px;
}
.btn:focus {
  outline: none;
}
.container {
  margin-top: 0;
  margin-bottom: 30px;
   animation: transitionIn 1s ease;
  

}
@keyframes transitionIn {
  from {
    opacity: 0;
    transform: rotateY(100deg);
  }

  to {
    opacity: 1;
    transform: rotateY(0);
  }
}  @media (min-width: 768px) {
  .container {
display: flex;
justify-content: center;
  }
}  
/* @media only screen and (orientation: landscape) {
   .container {
display: flex;
justify-content: center;
  }
} */
/* /* /* Extra small devices (phones, 600px and down) */
/* @media only screen and (max-width: 600px) {...}

/* Small devices (portrait tablets and large phones, 600px and up) */
/* @media only screen and (min-width: 600px) {...} */

/* Medium devices (landscape tablets, 768px and up) */
/* @media only screen and (min-width: 768px) {...} */

/* Large devices (laptops/desktops, 992px and up) */
/* @media only screen and (min-width: 992px) {...} */

/* Extra large devices (large laptops and desktops, 1200px and up) */
/* @media only screen and (min-width: 1200px) {...} */ 
</style>