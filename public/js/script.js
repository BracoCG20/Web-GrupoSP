const navbar = document.getElementById("navbar");
const SCROLLED_CLASS = "nav--scrolled";
window.addEventListener("scroll", () => {
	if (navbar) {
		if (window.scrollY > 50) {
			navbar.classList.add(SCROLLED_CLASS);
		} else {
			navbar.classList.remove(SCROLLED_CLASS);
		}
	}
});
const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");
const ACTIVE_CLASS = "sidebar--active";
const isButtonOrIcon = (target) => {
	return btnMenu && (btnMenu.contains(target) || target === btnMenu);
};
if (btnMenu && sidebar) {
	btnMenu.addEventListener("click", () => {
		sidebar.classList.toggle(ACTIVE_CLASS);
		const isExpanded = sidebar.classList.contains(ACTIVE_CLASS);
		btnMenu.setAttribute("aria-expanded", isExpanded);
	});
	document.addEventListener("click", (e) => {
		if (
			!sidebar.contains(e.target) &&
			!isButtonOrIcon(e.target) &&
			sidebar.classList.contains(ACTIVE_CLASS)
		) {
			sidebar.classList.remove(ACTIVE_CLASS);
			btnMenu.setAttribute("aria-expanded", false);
		}
	});
}
function initSwiperSlider(selector, config) {
	const element = document.querySelector(selector);
	if (typeof Swiper !== "undefined" && element) {
		new Swiper(selector, config);
	}
}
function initLogosSlider() {
	initSwiperSlider(".logos-slider", {
		direction: "horizontal",
		loop: true,
		speed: 5000,
		spaceBetween: 50,
		autoplay: {
			delay: 0,
			disableOnInteraction: false,
		},
		slidesPerView: "auto",
		breakpoints: {
			320: { spaceBetween: 30 },
			1024: { spaceBetween: 50 },
		},
	});
}
function initNewsSlider() {
	initSwiperSlider(".news-section__slider", {
		direction: "horizontal",
		loop: true,
		spaceBetween: 20,
		scrollbar: { el: ".swiper-scrollbar" },
		breakpoints: {
			320: { slidesPerView: 1, spaceBetween: 20 },
			768: { slidesPerView: 2, spaceBetween: 30 },
			1024: { slidesPerView: 3, spaceBetween: 30 },
			1440: { slidesPerView: 4, spaceBetween: 30 },
		},
	});
}
function initValuesSlider() {
	initSwiperSlider(".values-section__slider", {
		direction: "horizontal",
		loop: true,
		spaceBetween: 20,
		scrollbar: { el: ".swiper-scrollbar" },
		breakpoints: {
			320: { slidesPerView: 1, spaceBetween: 20 },
			768: { slidesPerView: 2, spaceBetween: 30 },
			1024: { slidesPerView: 3, spaceBetween: 30 },
		},
	});
}
function initImpactSlider() {
	initSwiperSlider(".impact-section__slider", {
		direction: "horizontal",
		loop: true,
		spaceBetween: 20,
		scrollbar: { el: ".swiper-scrollbar" },
		breakpoints: {
			320: { slidesPerView: 1, spaceBetween: 20 },
			768: { slidesPerView: 2, spaceBetween: 30 },
			1024: { slidesPerView: 3, spaceBetween: 30 },
		},
	});
}
function initTabs() {
	const tabOptions = document.querySelectorAll(".tab-option");
	const tabPanelContainer = document.querySelector(".tab-content__container");
	if (!tabOptions.length || !tabPanelContainer) return;
	tabOptions.forEach((option) => {
		option.addEventListener("click", () => {
			const targetTabId = option.getAttribute("data-tab");
			tabOptions.forEach((opt) => opt.classList.remove("active"));
			const activePanels =
				tabPanelContainer.querySelectorAll(".tab-panel.active");
			activePanels.forEach((panel) => panel.classList.remove("active"));
			option.classList.add("active");
			const targetPanel = tabPanelContainer.querySelector(
				`.tab-panel[data-content="${targetTabId}"]`
			);
			if (targetPanel) {
				targetPanel.classList.add("active");
			}
		});
	});
}
window.addEventListener("load", () => {
	initLogosSlider();
	initNewsSlider();
	initValuesSlider();
	initImpactSlider();
});
const scrollLink = document.querySelector(".hero__scroll-link");
if (scrollLink && navbar) {
	scrollLink.addEventListener("click", (e) => {
		e.preventDefault();
		const targetId = scrollLink.getAttribute("href");
		const targetElement = document.querySelector(targetId);
		if (targetElement) {
			const navbarHeight = navbar.offsetHeight;
			const elementPosition = targetElement.getBoundingClientRect().top;
			const offsetPosition =
				elementPosition + window.pageYOffset - navbarHeight;
			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	});
}
function initCustomSlider() {
	const container = document.getElementById("sliderContainer");
	if (!container) return;
	let originalItems = Array.from(
		document.querySelectorAll(".logos-wrapper > div")
	);
	const descriptions = document.querySelectorAll(".description-item");
	const scrollThumb = document.getElementById("customScrollThumb");
	const btnPrev = document.getElementById("btnPrev");
	const btnNext = document.getElementById("btnNext");
	if (originalItems.length === 0) return;
	originalItems.forEach((item, index) => {
		item.dataset.originalIndex = index;
	});
	const ANIMATION_TIME = 500;
	let allItems = [];
	let currentIndex = 0;
	let isAnimating = false;
	const setupInfiniteLoop = () => {
		[...originalItems].reverse().forEach((item) => {
			const clone = item.cloneNode(true);
			clone.dataset.isClone = "true";
			container.insertBefore(clone, container.firstChild);
		});
		originalItems.forEach((item) => {
			const clone = item.cloneNode(true);
			clone.dataset.isClone = "true";
			container.appendChild(clone);
		});
		allItems = Array.from(document.querySelectorAll(".logos-wrapper > div"));
		currentIndex = originalItems.length;
		forceScrollTo(currentIndex, false);
		updateVisualState(currentIndex);
	};
	const getCenterPosition = (element) => {
		if (window.innerWidth >= 768) {
			const containerCenter = container.clientHeight / 2;
			const elementCenter = element.offsetHeight / 2;
			return element.offsetTop - containerCenter + elementCenter;
		}
		const containerCenter = container.clientWidth / 2;
		const elementCenter = element.offsetWidth / 2;
		return element.offsetLeft - containerCenter + elementCenter;
	};
	const forceScrollTo = (index, smooth = true) => {
		const target = allItems[index];
		if (!target) return;
		const pos = getCenterPosition(target);
		container.scrollTo({
			top: window.innerWidth >= 768 ? pos : 0,
			left: window.innerWidth < 768 ? pos : 0,
			behavior: smooth ? "smooth" : "auto",
		});
	};
	const updateVisualState = (index) => {
		allItems.forEach((el) => el.classList.remove("is-active"));
		if (allItems[index]) {
			const activeItem = allItems[index];
			activeItem.classList.add("is-active");
			const targetId = activeItem.getAttribute("data-target");
			updateDescription(targetId);
			if (scrollThumb && originalItems.length > 0) {
				const realIndex = parseInt(activeItem.dataset.originalIndex);
				const thumbHeightPercentage = 100 / originalItems.length;
				const topPositionPercentage = realIndex * thumbHeightPercentage;
				scrollThumb.style.height = `${thumbHeightPercentage}%`;
				scrollThumb.style.top = `${topPositionPercentage}%`;
			}
		}
	};
	const updateDescription = (targetId) => {
		descriptions.forEach((desc) => desc.classList.remove("is-visible"));
		const targetDesc = document.getElementById(targetId);
		if (targetDesc) targetDesc.classList.add("is-visible");
	};
	const goToIndex = (index, smooth = true) => {
		if (isAnimating) return;
		isAnimating = true;
		currentIndex = index;
		updateVisualState(currentIndex);
		forceScrollTo(currentIndex, smooth);
		const currentItem = allItems[currentIndex];
		if (currentItem && currentItem.dataset.isClone === "true") {
			setTimeout(() => {
				const originalIndexVal = parseInt(currentItem.dataset.originalIndex);
				const realOriginalIndex = originalItems.length + originalIndexVal;
				currentIndex = realOriginalIndex;
				allItems.forEach((el) => el.classList.add("no-transition"));
				forceScrollTo(currentIndex, false);
				updateVisualState(currentIndex);
				void container.offsetWidth;
				allItems.forEach((el) => el.classList.remove("no-transition"));
				isAnimating = false;
			}, ANIMATION_TIME);
		} else {
			setTimeout(
				() => {
					isAnimating = false;
				},
				smooth ? ANIMATION_TIME : 0
			);
		}
	};
	container.addEventListener("click", (e) => {
		const item = e.target.closest(".logos-wrapper > div");
		if (!item) return;
		goToIndex(allItems.indexOf(item), true);
	});
	if (btnNext) {
		btnNext.addEventListener("click", () => {
			goToIndex(currentIndex + 1, true);
		});
	}
	if (btnPrev) {
		btnPrev.addEventListener("click", () => {
			goToIndex(currentIndex - 1, true);
		});
	}
	window.addEventListener("resize", () => {
		allItems.forEach((el) => el.classList.add("no-transition"));
		forceScrollTo(currentIndex, false);
		void container.offsetWidth;
		allItems.forEach((el) => el.classList.remove("no-transition"));
	});
	setupInfiniteLoop();
}
document.addEventListener("DOMContentLoaded", () => {
	initCustomSlider();
	initTabs();
});
const scrollTopLink = document.getElementById("scrollTopLink");
if (scrollTopLink) {
	scrollTopLink.addEventListener("click", (e) => {
		e.preventDefault();
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	});
}
document.addEventListener("DOMContentLoaded", () => {
	const year = new Date().getFullYear();
	const element = document.getElementById("copyright");
	if (element) {
		element.textContent = `Grupo SP © ${year} - Todos los derechos reservados.`;
	}
});
