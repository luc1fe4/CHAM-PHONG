// ========== MOBILE TOUCH INTERACTIONS ========== //

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== MOBILE DETECTION ========== //
    const isMobile = () => {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // ========== TOUCH FEEDBACK ========== //
    function addTouchFeedback() {
        const touchElements = document.querySelectorAll('button, .room-card, label, .mainNav a, .tabs-nav button');
        
        touchElements.forEach(element => {
            // Touch start - add pressed effect
            element.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.95)';
                this.style.transition = 'transform 0.1s ease';
            }, { passive: true });

            // Touch end - remove pressed effect
            element.addEventListener('touchend', function(e) {
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }, { passive: true });

            // Touch cancel - remove pressed effect
            element.addEventListener('touchcancel', function(e) {
                this.style.transform = '';
            }, { passive: true });
        });
    }

    // ========== SMOOTH SCROLLING ========== //
    function enableSmoothScrolling() {
        const scrollElements = document.querySelectorAll('.tabs-nav, .excel-table-wrapper, .table-container');
        
        scrollElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.scrollBehavior = 'smooth';
        });
    }

    // ========== PREVENT ZOOM ON INPUT FOCUS ========== //
    function preventZoomOnInput() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                // Temporarily set viewport to prevent zoom
                const viewport = document.querySelector('meta[name=viewport]');
                const originalContent = viewport.content;
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
                
                // Restore original viewport after blur
                input.addEventListener('blur', function() {
                    setTimeout(() => {
                        viewport.content = originalContent;
                    }, 100);
                }, { once: true });
            });
        });
    }

    // ========== IMPROVED TABLE SCROLL INDICATOR ========== //
    function addScrollIndicators() {
        const tableWrappers = document.querySelectorAll('.excel-table-wrapper, .table-container');
        
        tableWrappers.forEach(wrapper => {
            const indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            indicator.innerHTML = '← Vuốt để xem thêm →';
            indicator.style.cssText = `
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
            `;
            
            wrapper.style.position = 'relative';
            wrapper.appendChild(indicator);

            // Show indicator when scrollable
            const checkScrollable = () => {
                const isScrollable = wrapper.scrollWidth > wrapper.clientWidth;
                const isAtStart = wrapper.scrollLeft === 0;
                const isAtEnd = wrapper.scrollLeft >= wrapper.scrollWidth - wrapper.clientWidth - 1;
                
                if (isScrollable && (isAtStart || isAtEnd)) {
                    indicator.style.opacity = '1';
                    setTimeout(() => {
                        indicator.style.opacity = '0';
                    }, 2000);
                }
            };

            // Check on load and resize
            checkScrollable();
            window.addEventListener('resize', checkScrollable);
            
            // Hide on scroll
            wrapper.addEventListener('scroll', () => {
                indicator.style.opacity = '0';
            });
        });
    }

    // ========== PULL TO REFRESH ========== //
    function addPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        const threshold = 100;
        
        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-refresh-indicator';
        refreshIndicator.innerHTML = '↓ Kéo để làm mới';
        refreshIndicator.style.cssText = `
            position: fixed;
            top: -50px;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            transition: transform 0.3s ease;
            z-index: 1001;
        `;
        document.body.appendChild(refreshIndicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isDragging = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                
                if (diff > 0 && diff < threshold * 2) {
                    e.preventDefault();
                    const progress = Math.min(diff / threshold, 1);
                    refreshIndicator.style.transform = `translateY(${diff * 0.5}px)`;
                    
                    if (progress >= 1) {
                        refreshIndicator.innerHTML = '↑ Thả để làm mới';
                    } else {
                        refreshIndicator.innerHTML = '↓ Kéo để làm mới';
                    }
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                const diff = currentY - startY;
                
                if (diff >= threshold) {
                    refreshIndicator.innerHTML = '🔄 Đang làm mới...';
                    refreshIndicator.style.transform = 'translateY(50px)';
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    refreshIndicator.style.transform = '';
                }
                
                isDragging = false;
            }
        }, { passive: true });
    }

    // ========== SWIPE GESTURES FOR TABS ========== //
    function addSwipeGestures() {
        const tabsNav = document.querySelector('.tabs-nav');
        if (!tabsNav) return;

        let startX = 0;
        let startTime = 0;
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;

        tabsNav.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startTime = Date.now();
        }, { passive: true });

        tabsNav.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endTime = Date.now();
            const distance = Math.abs(endX - startX);
            const duration = endTime - startTime;

            if (distance > minSwipeDistance && duration < maxSwipeTime) {
                const tabs = Array.from(tabsNav.querySelectorAll('button'));
                const activeIndex = tabs.findIndex(tab => tab.classList.contains('active'));
                
                if (startX > endX && activeIndex < tabs.length - 1) {
                    // Swipe left - next tab
                    tabs[activeIndex + 1].click();
                } else if (startX < endX && activeIndex > 0) {
                    // Swipe right - previous tab
                    tabs[activeIndex - 1].click();
                }
            }
        }, { passive: true });
    }

    // ========== HAPTIC FEEDBACK ========== //
    function addHapticFeedback() {
        const buttons = document.querySelectorAll('button, .room-card');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(10); // Very short vibration
                }
            });
        });
    }

    // ========== IMPROVED SEARCH INPUT ========== //
    function enhanceSearchInput() {
        const searchInputs = document.querySelectorAll('#searchInput, .search-input');
        
        searchInputs.forEach(input => {
            // Add search icon
            const wrapper = document.createElement('div');
            wrapper.className = 'search-wrapper';
            wrapper.style.cssText = `
                position: relative;
                display: flex;
                align-items: center;
            `;
            
            const icon = document.createElement('span');
            icon.innerHTML = '🔍';
            icon.style.cssText = `
                position: absolute;
                left: 12px;
                z-index: 1;
                pointer-events: none;
            `;
            
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(icon);
            wrapper.appendChild(input);
            
            // Adjust padding for icon
            input.style.paddingLeft = '35px';
            
            // Clear button
            const clearBtn = document.createElement('button');
            clearBtn.innerHTML = '×';
            clearBtn.type = 'button';
            clearBtn.style.cssText = `
                position: absolute;
                right: 8px;
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            `;
            
            wrapper.appendChild(clearBtn);
            
            // Show/hide clear button
            input.addEventListener('input', () => {
                clearBtn.style.display = input.value ? 'flex' : 'none';
            });
            
            clearBtn.addEventListener('click', () => {
                input.value = '';
                input.focus();
                clearBtn.style.display = 'none';
                input.dispatchEvent(new Event('input')); // Trigger search
            });
        });
    }

    // ========== LAZY LOADING FOR IMAGES ========== //
    function addLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    // ========== INITIALIZE MOBILE FEATURES ========== //
    if (isMobile()) {
        addTouchFeedback();
        enableSmoothScrolling();
        preventZoomOnInput();
        addScrollIndicators();
        addPullToRefresh();
        addSwipeGestures();
        addHapticFeedback();
        enhanceSearchInput();
        addLazyLoading();
        
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Optimize viewport for mobile
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
        }
    }

    // ========== ORIENTATION CHANGE HANDLER ========== //
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Recalculate dimensions after orientation change
            window.scrollTo(0, 0);
            
            // Refresh scroll indicators
            if (isMobile()) {
                addScrollIndicators();
            }
        }, 100);
    });

    // ========== RESIZE HANDLER ========== //
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isMobile()) {
                addScrollIndicators();
            }
        }, 250);
    });
});

// ========== EXPORT FOR USE IN OTHER SCRIPTS ========== //
window.MobileUtils = {
    isMobile: () => window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    showToast: (message, duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = 'mobile-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }
};