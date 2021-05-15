import { LitElement, html } from 'https://cdn.skypack.dev/pin/lit@v2.0.0-rc.1-VBzsFNL5Th0HrFTVPQSz/mode=imports/optimized/lit.js';
import faunadb from 'https://cdn.skypack.dev/pin/faunadb@v4.2.0-w96MXOARYnCtV5upO1if/mode=imports/optimized/faunadb.js';
import 'https://assets.yax.com/scripts/yax-template-card.js';
import Swiper from 'https://unpkg.com/swiper/swiper-bundle.esm.browser.min.js'

async function fetchData(category) {
  // FAUNA_ACCESS_KEY has read-only access to the templates collection
  const FAUNA_ACCESS_KEY = 'fnAD1mZSu4ACEgC50HpntnFoMh194-bBx273g2lU';
  const q = faunadb.query;
  const client = new faunadb.Client({
    secret: FAUNA_ACCESS_KEY
  });
  const response = await client.query(
    q.Map(
      q.Paginate(
          q.Match(q.Index('templates_sort_by_rank'), category)
        ),
      q.Lambda(['rank', 'ref'], q.Get(q.Var('ref')))
    )
  );
  return await response.data;
}

export class YaxTemplateGallery extends LitElement {

  constructor() {
    super();
    this.category = 'tiny_sites';
  }

  static get properties() {
    return {
      category: { type: String },
      data: { type: Array, attribute: false }
    }
  }

  async performUpdate() {
    if (!this.data) {
       this.data = await fetchData(this.category);
    }
    super.performUpdate();
    // Swiper carousel must be initialized AFTER data is fetched and super.performUpdate() calls render()
    const swiper = new Swiper('.swiper-container', {
      slidesPerView: 2,
      spaceBetween: 20,
      breakpoints: {
        768: {
          slidesPerView: 4,
          spaceBetween: 10
        }
      },
      watchOverflow: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }
    });
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css">
      <style>
        .swiper-container {
          margin-bottom: 2rem;
        }
        .swiper-slide {
          padding-top: 2rem;
          padding-bottom: 2rem;
          -webkit-transition: 250ms all;
          transition: 250ms all;
        }
        .swiper-slide:hover {
          -webkit-transform: scale(1.05);
          transform: scale(1.05);
          z-index: 1;
        }
        .swiper-button-prev,
        .swiper-button-next {
          width: 60px;
          height: 60px;
          background: gray;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 60px;
          z-index: 9999;
        }
      </style>
      <div class="swiper-container">
        <div class="swiper-wrapper">
        ${!Array.isArray(this.data) || !this.data.length ?
          html`<yax-template-card class="swiper-slide"></yax-template-card>` :
          html`${this.data.map(item => html`
          <yax-template-card class="swiper-slide"
            template_id="${item.data.template_id}"
            author="${item.data.author}"
            template_title="${item.data.template_title}"
            description="${item.data.description}"
            template_img="${item.data.template_img}"
            author_img="${item.data.author_img}">
          </yax-template-card>
        `)}`}
        </div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    `;
  }

}

customElements.define('yax-template-gallery', YaxTemplateGallery);
