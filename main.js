
(function () {
	var animation_elements = $.find('.animation-element');
	var web_window = $(window);
	var newElement = $('<embed id="resume" src="WebsiteResume.pdf"/>');
	var parent = $('#resume').parent();
   //////////////////////
	// Utils
  //////////////////////
    function throttle(fn, delay, scope) {
        // Default delay
        delay = delay || 100;
        var last, defer;
        return function () {
            var context = scope || this,
                now = +new Date(),
                args = arguments;
            if (last && now < last + delay) {
                clearTimeout(defer);
                defer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, delay);
            } else {
                last = now;
                fn.apply(context, args);
            }
        }
    }

    function extend(destination, source) {
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                destination[k] = source[k];
            }
        }
        return destination;
    }
	
	function check_if_in_view() {
		//get current window information
		var window_height = web_window.height();
		var window_top_position = web_window.scrollTop();
		var window_bottom_position = (window_top_position + window_height);

		//iterate through elements to see if its in view
		$.each(animation_elements, function() {

		//get the element sinformation
			var element = $(this);
			var element_height = $(element).outerHeight();
			var element_top_position = $(element).offset().top;
			var element_bottom_position = (element_top_position + element_height);

			//check to see if this current container is visible (its viewable if it exists between the viewable space of the viewport)
			if ((element_bottom_position >= window_top_position) && (element_top_position <= window_bottom_position)) {
				element.addClass('in-view');
		}
    });

  }
  
   //////////////////////
	// END Utils
  //////////////////////
  
   //////////////////////
   // Scroll Module
   //////////////////////

    var ScrollManager = (function () {

        var defaults = {

                steps: null,
                navigationContainer: null,
                links: null,

                navigationElementClass: '.Quick-navigation',
                currentStepClass: 'current',
                smoothScrollEnabled: true,
                stepsCheckEnabled: true,

                // Callbacks
                onScroll: null,

                onStepChange: function (step) {
                    var self = this;
                    var relativeLink = [].filter.call(options.links, function (link) {
                        link.classList.remove(self.currentStepClass);
                        return link.hash === '#' + step.id;
                    });
                    relativeLink[0].classList.add(self.currentStepClass);
                },

                // Provide a default scroll animation
                smoothScrollAnimation: function (target) {
                    $('html, body').animate({
                        scrollTop: target
                    }, 'slow');
                }
            },

            options = {};

        // Privates
        var _animation = null,
            currentStep = null,
            throttledGetScrollPosition = null;

        return {

            scrollPosition: 0,

            init: function (opts) {

                options = extend(defaults, opts);

                if (options.steps === null) {
                    console.warn('Smooth scrolling require some sections or steps to scroll to :)');
                    return false;
                }

                // Allow to customize the animation engine ( jQuery / GSAP / velocity / ... )
                _animation = function (target) {
                    target = typeof target === 'number' ? target : $(target).offset().top;
                    return options.smoothScrollAnimation(target);
                };

                // Activate smooth scrolling
                if (options.smoothScrollEnabled)  this.smoothScroll();

                // Throttle for performances gain
                throttledGetScrollPosition = throttle(this.getScrollPosition).bind(this);
                window.addEventListener('scroll', throttledGetScrollPosition);
                window.addEventListener('resize', throttledGetScrollPosition);
                this.getScrollPosition();
            },

            getScrollPosition: function () {
                this.scrollPosition = window.pageYOffset || window.scrollY;
                if (options.stepsCheckEnabled) this.checkActiveStep();
                if (typeof  options.onScroll === 'function') options.onScroll(this.scrollPosition);
            },

            doSmoothScroll: function (e) {
                if (e.target.nodeName === 'A') {
                    e.preventDefault();
                    if (location.pathname.replace(/^\//, '') === e.target.pathname.replace(/^\//, '') && location.hostname === e.target.hostname) {
                        var targetStep = document.querySelector(e.target.hash);
                        targetStep ? _animation(targetStep) : console.warn('Hi! You should give an animation callback function to the Scroller module! :)');
                    }
                }
            },

            smoothScroll: function () {
                if (options.navigationContainer !== null) options.navigationContainer.addEventListener('click', this.doSmoothScroll);
            },

            checkActiveStep: function () {
                var scrollPosition = this.scrollPosition;

                [].forEach.call(options.steps, function (step) {
                    var bBox = step.getBoundingClientRect(),
                        position = step.offsetTop,
                        height = position + bBox.height;

                    if (scrollPosition >= position && scrollPosition < height && currentStep !== step) {
                        currentStep = step;
                        step.classList.add(self.currentStepClass);
						id = currentStep.id;
						if (id == "A") {
							
						}
                        if (typeof options.onStepChange === 'function') options.onStepChange(step);
                    }
					
                    step.classList.remove(options.currentStepClass);
                });
				
            },

            destroy: function () {
                window.removeEventListener('scroll', throttledGetScrollPosition);
                window.removeEventListener('resize', throttledGetScrollPosition);
                options.navigationContainer.removeEventListener('click', this.doSmoothScroll);
            }
        }
    })();

    var steps = document.querySelectorAll('.js-scroll-step'),
        navigationContainer = document.querySelector('.Quick-navigation'),
        links = navigationContainer.querySelectorAll('a');

    ScrollManager.init({
        steps: steps,
        navigationContainer: navigationContainer,
        links: links,
      
        // Customize onScroll behavior
        onScroll: function () {
			check_if_in_view();
			resetSliderWidth();
        },
      
    });

})();

//current position
var pos = 0;
//number of slides
var totalSlides = $('.slider-wrap ul li').length/3;

var sliderWidth = $('slider-wrap').width();

function resetSliderWidth() {
	$('.slider-wrap ul.slider').width(sliderWidth*totalSlides+1);
	sliderWidth = $('.slider-wrap').width();
}

$(document).ready(function(){
	resetSliderWidth();
	window.addEventListener('resize', resetSliderWidth);
	
    //next slide 	
	$('.next').click(function(){
		slideRight();
	});
	
	//previous slide
	$('.previous').click(function(){
		slideLeft();
	});
	
	
	
	/*************************
	 //*> OPTIONAL SETTINGS
	************************/
	//automatic slider
	var autoSlider = setInterval(slideRight, 3000);
	
	//for each slide 
	for (i = 0; i < 2; i++) {
	   //create a pagination
	   var li = document.createElement('li');
	   $('.pagination-wrap ul').append(li);	   
	}
	
	//counter	
	//pagination
	pagination();
	
	//hide/show controls/btns when hover
	//pause automatic slide when hover
	$('.slider-wrap').hover(
	  function(){ $(this).addClass('active'); clearInterval(autoSlider); }, 
	  function(){ $(this).removeClass('active'); autoSlider = setInterval(slideRight, 3000); }
	);
	
});//DOCUMENT READY
	


/***********
 SLIDE LEFT
************/
function slideLeft(){
	pos--;
	if(pos==-1){ pos = totalSlides-1; }
	$('.slider-wrap ul.slider').css('left', -(sliderWidth*pos)); 	
	
	//*> optional
	pagination();
}

/************
 SLIDE RIGHT
*************/
function slideRight(){
	pos++;
	if(pos==totalSlides){ pos = 0; }
	$('.slider-wrap ul.slider').css('left', -(sliderWidth*pos)); 
	
	//*> optional 
	pagination();
}



	
/************************
 //*> OPTIONAL SETTINGS
************************/
function pagination(){
	$('.pagination-wrap ul li').removeClass('active');
	for (i = 0; i < 3; i++) {
		num = pos + (i*2);
		$('.pagination-wrap ul li:eq('+num+')').addClass('active');
	}
	
}
		
	