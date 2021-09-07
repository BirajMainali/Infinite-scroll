const __ = document.querySelector.bind(document);
const image_row = __('.row');

const ImageLoaderFactory = (limit = 15, renderer = null) => {
    return {
        limit: limit,
        page: 1,
        tempImg: 'https://atlan.com/assets/static/loading.77c2c98.9727475.gif',
        loading: false,
        renderer: renderer,
        load: async function () {
            if (this.loading) {
                setTimeout(() => this.load(), 2000);
                return;
            }
            this.loading = true;
            const newImages = await loadImageUrls(this.limit, this.page);
            this.page++;
            this.renderer && this.renderer(newImages);
            this.loading = false;
            return newImages;

            async function loadImageUrls(limit, page) {
                const rawImages = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`).then(res => res.json());
                return rawImages.map(x => x.download_url);
            }
        },
    };
};
const imageLoader = ImageLoaderFactory(15, renderImages);

async function renderImages(images) {
    const image_wrapper_template = __('#image--wrapper');
    const frag = document.createDocumentFragment();
    images.forEach(url => {
        const elem = image_wrapper_template.content.cloneNode(true);
        const imgElem = elem.querySelector('.image');
        imgElem.src = imageLoader.tempImg;
        imgElem.dataset.src = url;
        frag.appendChild(elem);
    });
    image_row.appendChild(frag);
}

__(".load-more").addEventListener('click', async () => {
    await imageLoader.load();
})

window.addEventListener('DOMContentLoaded', async (e) => {
    await imageLoader.load();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(async x => {
            if (x.isIntersecting) {
                await imageLoader.load();
            }
        });
    }, {root: null, threshold: 0.5});

    observer.observe(__('.load-more'));
});