const __ = document.querySelector.bind(document);
const image_row = __('.row');

const ImageLoaderFactory = (limit = 15, renderer = null) => {
    return {
        limit: limit,
        page: 1,
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
    const imageElems = [];
    images.forEach(url => {
        const elem = image_wrapper_template.content.cloneNode(true);
        const imgElem = elem.querySelector('.image');
        imgElem.dataset.src = url;
        frag.appendChild(elem);
        imageElems.push(imgElem);
    });
    image_row.appendChild(frag);
    setTimeout(() => {
        imageElems.forEach(elm => {
            const url = elm.dataset.src;
            fetch(url).then(res => res.blob()).then(x => {
                elm.src = URL.createObjectURL(x);
            });
        });
    }, 0);
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