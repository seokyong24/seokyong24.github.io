// 페이지 로드 시 항상 맨 위로 가기
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Header Scroll Effect
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        mainNav.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('active');
            mainNav.classList.remove('active');
        });
    });

    // 3. Scroll Animation (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // 15% of the element must be visible
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once faded in
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // Trigger initial check for elements already in view
    setTimeout(() => {
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // 4. 부드러운 구간별 스크롤 제어 (Fullpage scroll)
    const sections = Array.from(document.querySelectorAll('section, .footer'));
    let isScrolling = false;

    function getCurrentSectionIndex() {
        let minDiff = Infinity;
        let index = 0;
        sections.forEach((sec, i) => {
            const diff = Math.abs(sec.getBoundingClientRect().top);
            if (diff < minDiff) {
                minDiff = diff;
                index = i;
            }
        });
        return index;
    }

    function scrollToSection(index) {
        isScrolling = true;
        sections[index].scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            isScrolling = false;
        }, 1000); // 1초 대기하여 너무 빠른 연속 스크롤 방지
    }

    window.addEventListener('wheel', (e) => {
        if (window.innerWidth <= 992) return; // 모바일/태블릿에서는 기본 스크롤
        
        // 음식점 리스트 내부 스크롤 예외 처리
        const scrollableList = e.target.closest('.restaurant-list');
        if (scrollableList) {
            const isAtTop = scrollableList.scrollTop <= 0;
            const isAtBottom = Math.ceil(scrollableList.scrollTop + scrollableList.clientHeight) >= scrollableList.scrollHeight - 1;

            if (e.deltaY > 0 && !isAtBottom) {
                return;
            }
            if (e.deltaY < 0 && !isAtTop) {
                return;
            }
        }

        e.preventDefault();
        
        if (isScrolling) return;
        
        let currentIndex = getCurrentSectionIndex();
        
        if (e.deltaY > 0) {
            currentIndex = Math.min(currentIndex + 1, sections.length - 1);
        } else {
            currentIndex = Math.max(currentIndex - 1, 0);
        }
        
        scrollToSection(currentIndex);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        if (window.innerWidth <= 992) return;
        
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            if (isScrolling) return;
            let currentIndex = getCurrentSectionIndex();
            currentIndex = Math.min(currentIndex + 1, sections.length - 1);
            scrollToSection(currentIndex);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            if (isScrolling) return;
            let currentIndex = getCurrentSectionIndex();
            currentIndex = Math.max(currentIndex - 1, 0);
            scrollToSection(currentIndex);
        }
    });

    // 5. 모범음식점 구글 지도 연동
    const restCards = document.querySelectorAll('.restaurant-card');
    const restMap = document.getElementById('restaurant-map');
    const mapOverlay = document.getElementById('map-overlay');

    if (restCards.length > 0 && restMap) {
        restCards.forEach(card => {
            card.addEventListener('click', () => {
                // 활성화 스타일 갱신
                restCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // 안내 오버레이 숨기기
                if (mapOverlay) {
                    mapOverlay.classList.add('hidden');
                }

                // 카드 내의 주소를 읽어서 구글 지도 쿼리로 변환
                const address = card.querySelector('.rest-address').innerText;
                const query = encodeURIComponent(`강원특별자치도 양구군 ${address}`);
                
                // iframe src 변경 (Google Maps Embed API)
                restMap.src = `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
            });
        });
    }

    // 6. 여행 추천 코스 탭 및 지도 연동
    const courseTabs = document.querySelectorAll('.course-tab');
    const courseContents = document.querySelectorAll('.course-content');
    const courseSvgs = document.querySelectorAll('.course-svg');

    if (courseTabs.length > 0) {
        courseTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 활성화 상태 초기화
                courseTabs.forEach(t => t.classList.remove('active'));
                courseContents.forEach(c => c.classList.remove('active'));
                courseSvgs.forEach(svg => svg.classList.remove('active'));

                // 현재 클릭한 탭 활성화
                tab.classList.add('active');
                const targetCourse = tab.getAttribute('data-course');
                
                // 해당 코스 내용 표시
                const targetContent = document.getElementById(`course-${targetCourse}`);
                if (targetContent) targetContent.classList.add('active');

                // SVG 애니메이션 트리거
                const targetSvg = document.getElementById(`svg-${targetCourse}`);
                if (targetSvg) {
                    // 브라우저 리플로우 강제 발생 (애니메이션 재시작)
                    void targetSvg.offsetWidth;
                    targetSvg.classList.add('active');
                }
            });
        });
    }

    // 6-2. 양구 곰취 소개 코너 탭 연동
    const gomchwiTabs = document.querySelectorAll('.gomchwi-tab');
    const gomchwiContents = document.querySelectorAll('.gomchwi-content');

    if (gomchwiTabs.length > 0) {
        gomchwiTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 활성화 상태 초기화
                gomchwiTabs.forEach(t => t.classList.remove('active'));
                gomchwiContents.forEach(c => c.classList.remove('active'));

                // 현재 클릭한 탭 활성화
                tab.classList.add('active');
                const targetGomchwi = tab.getAttribute('data-gomchwi');

                // 해당 내용 표시
                const targetContent = document.getElementById(`gomchwi-${targetGomchwi}`);
                if (targetContent) targetContent.classList.add('active');
            });
        });
    }

    // 7. Floating Action Button (FAB) Menu Toggle
    const fabContainer = document.querySelector('.fab-container');
    const fabToggle = document.getElementById('fab-toggle');
    const fabItems = document.querySelectorAll('.fab-item');

    if (fabContainer && fabToggle) {
        fabToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            fabContainer.classList.toggle('active');
        });

        // 항목 클릭 시 메뉴 닫기 (이동은 a href 해시로 자연스럽게 이루어짐)
        fabItems.forEach(item => {
            item.addEventListener('click', () => {
                fabContainer.classList.remove('active');
            });
        });

        // 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!fabContainer.contains(e.target)) {
                fabContainer.classList.remove('active');
            }
        });
    }
});
