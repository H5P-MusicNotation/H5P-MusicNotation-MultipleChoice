/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/globals.js":
/*!***********************!*\
  !*** ./js/globals.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventDispatcher": () => (/* binding */ EventDispatcher),
/* harmony export */   "JoubelUI": () => (/* binding */ JoubelUI),
/* harmony export */   "Question": () => (/* binding */ Question),
/* harmony export */   "jQuery": () => (/* binding */ jQuery),
/* harmony export */   "shuffleArray": () => (/* binding */ shuffleArray)
/* harmony export */ });
const EventDispatcher = H5P.EventDispatcher;
const jQuery = H5P.jQuery;
const JoubelUI = H5P.JoubelUI;
const Question = H5P.Question;
const shuffleArray = H5P.shuffleArray;

/***/ }),

/***/ "./js/musicnotation-multichoice.js":
/*!*****************************************!*\
  !*** ./js/musicnotation-multichoice.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./js/globals.js");
// Will render a Question with multiple choices for answers.
// Options format:
// {
//   title: "Optional title for question box",
//   question: "Question text",
//   answers: [{text: "Answer text", correct: false}, ...],
//   singleAnswer: true, // or false, will change rendered output slightly.
//   singlePoint: true,  // True if question give a single point score only
//                       // if all are correct, false to give 1 point per
//                       // correct answer. (Only for singleAnswer=false)
//   randomAnswers: false  // Whether to randomize the order of answers.
// }
//
// Events provided:
// - h5pQuestionAnswered: Triggered when a question has been answered.

/**
 * @typedef {Object} Options
 *   Options for multiple choice
 *
 * @property {Object} behaviour
 * @property {boolean} behaviour.confirmCheckDialog
 * @property {boolean} behaviour.confirmRetryDialog
 *
 * @property {Object} UI
 * @property {string} UI.tipsLabel
 *
 * @property {Object} [confirmRetry]
 * @property {string} [confirmRetry.header]
 * @property {string} [confirmRetry.body]
 * @property {string} [confirmRetry.cancelLabel]
 * @property {string} [confirmRetry.confirmLabel]
 *
 * @property {Object} [confirmCheck]
 * @property {string} [confirmCheck.header]
 * @property {string} [confirmCheck.body]
 * @property {string} [confirmCheck.cancelLabel]
 * @property {string} [confirmCheck.confirmLabel]
 */

/**
 * Module for creating a multiple choice question
 *
 * @param {Options} options
 * @param {number} contentId
 * @param {Object} contentData
 * @returns {MusicNotationMultiChoice}
 * @constructor
 */

//import VIBE from "verovioscoreeditor";

const MNMC = function () {
  /**
   * @param {*} options 
   * @param {*} contentId 
   * @param {*} contentData 
   * @returns 
   */
  function MusicNotationMultiChoice(options, contentId, contentData) {
    if (!(this instanceof MusicNotationMultiChoice)) return new MusicNotationMultiChoice(options, contentId, contentData);
    var self = this;
    this.contentId = contentId;
    this.contentData = contentData;
    _globals__WEBPACK_IMPORTED_MODULE_0__.Question.call(self, 'multichoice');
    this.taskContainerHeight = 0;
    var defaults = {
      image: null,
      question: "No question text provided",
      answers: [{
        tipsAndFeedback: {
          tip: '',
          chosenFeedback: '',
          notChosenFeedback: ''
        },
        text: "Answer 1",
        correct: true
      }],
      overallFeedback: [],
      weight: 1,
      userAnswers: [],
      UI: {
        checkAnswerButton: 'Check',
        submitAnswerButton: 'Submit',
        showSolutionButton: 'Show solution',
        tryAgainButton: 'Try again',
        scoreBarLabel: 'You got :num out of :total points',
        tipAvailable: "Tip available",
        feedbackAvailable: "Feedback available",
        readFeedback: 'Read feedback',
        shouldCheck: "Should have been checked",
        shouldNotCheck: "Should not have been checked",
        noInput: 'Input is required before viewing the solution',
        a11yCheck: 'Check the answers. The responses will be marked as correct, incorrect, or unanswered.',
        a11yShowSolution: 'Show the solution. The task will be marked with its correct solution.',
        a11yRetry: 'Retry the task. Reset all responses and start the task over again.'
      },
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: true,
        enableCheckButton: true,
        type: 'auto',
        singlePoint: true,
        randomAnswers: false,
        showSolutionsRequiresInput: true,
        autoCheck: false,
        passPercentage: 100,
        showScorePoints: true
      }
    };
    var params = _globals__WEBPACK_IMPORTED_MODULE_0__.jQuery.extend(true, defaults, options);
    console.log("Multichoice", params);

    //array of containers. will be used for scaling later
    // this.vibeContainer = []
    // this.vibeInstances = []

    // Keep track of number of correct choices
    var numCorrect = 0;

    // Loop through choices
    for (var i = 0; i < params.answers.length; i++) {
      var answer = params.answers[i];

      // Make sure tips and feedback exists
      answer.tipsAndFeedback = answer.tipsAndFeedback || {};
      if (params.answers[i].correct) {
        // Update number of correct choices
        numCorrect++;
      }
    }

    // Determine if no choices is the correct
    var blankIsCorrect = numCorrect === 0;

    // Determine task type
    if (params.behaviour.type === 'auto') {
      // Use single choice if only one choice is correct
      params.behaviour.singleAnswer = numCorrect === 1;
    } else {
      params.behaviour.singleAnswer = params.behaviour.type === 'single';
    }
    var getCheckboxOrRadioIcon = function (radio, selected) {
      var icon;
      if (radio) {
        icon = selected ? '&#xe603;' : '&#xe600;';
      } else {
        icon = selected ? '&#xe601;' : '&#xe602;';
      }
      return icon;
    };

    // Initialize buttons and elements.
    var $myDom;
    var $feedbackDialog;

    /**
     * Remove all feedback dialogs
     */
    var removeFeedbackDialog = function () {
      // Remove the open feedback dialogs.
      $myDom.unbind('click', removeFeedbackDialog);
      $myDom.find('.h5p-feedback-button, .h5p-feedback-dialog').remove();
      $myDom.find('.h5p-has-feedback').removeClass('h5p-has-feedback');
      if ($feedbackDialog) {
        $feedbackDialog.remove();
      }
    };
    var score = 0;
    var solutionsVisible = false;

    /**
     * Add feedback to element
     * @param {jQuery} $element Element that feedback will be added to
     * @param {string} feedback Feedback string
     */
    var addFeedback = function ($element, feedback) {
      $feedbackDialog = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('' + '<div class="h5p-feedback-dialog">' + '<div class="h5p-feedback-inner">' + '<div class="h5p-feedback-text">' + feedback + '</div>' + '</div>' + '</div>');

      //make sure feedback is only added once
      if (!$element.find((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-feedback-dialog')).length) {
        $feedbackDialog.appendTo($element.addClass('h5p-has-feedback'));
      }
    };

    /**
     * Register the different parts of the task with the Question structure.
     */
    self.registerDomElements = function () {
      var media = params.media;
      if (media && media.type && media.type.library) {
        media = media.type;
        var type = media.library.split(' ')[0];
        if (type === 'H5P.Image') {
          if (media.params.file) {
            // Register task image
            self.setImage(media.params.file.path, {
              disableImageZooming: params.media.disableImageZooming || false,
              alt: media.params.alt,
              title: media.params.title
            });
          }
        } else if (type === 'H5P.Video') {
          if (media.params.sources) {
            // Register task video
            self.setVideo(media);
          }
        } else if (type === 'H5P.Audio') {
          if (media.params.files) {
            // Register task audio
            self.setAudio(media);
          }
        }
      }

      // Determine if we're using checkboxes or radio buttons
      for (var i = 0; i < params.answers.length; i++) {
        params.answers[i].checkboxOrRadioIcon = getCheckboxOrRadioIcon(params.behaviour.singleAnswer, params.userAnswers.indexOf(i) > -1);
      }

      // Register Introduction
      self.setIntroduction('<div id="' + params.labelId + '">' + params.question + '</div>');

      // Register task content area
      $myDom = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<ul>', {
        'class': 'h5p-answers',
        role: params.role,
        'aria-labelledby': params.labelId
      });
      for (let i = 0; i < params.answers.length; i++) {
        const answer = params.answers[i];
        (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<li>', {
          'class': 'h5p-answer',
          role: answer.role,
          tabindex: answer.tabindex,
          'aria-checked': answer.checked,
          'data-id': i,
          html: '<div class="h5p-alternative-container" answer-id="' + i.toString() + '"><span class="h5p-alternative-inner">' + answer.text + '</span></div>',
          appendTo: $myDom
        });
      }
      self.setContent($myDom, {
        'class': params.behaviour.singleAnswer ? 'h5p-radio' : 'h5p-check'
      });

      // Create tips:
      var $answers = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-answer', $myDom).each(function (i) {
        var tip = params.answers[i].tipsAndFeedback.tip;
        if (tip === undefined) {
          return; // No tip
        }

        tip = tip.trim();
        var tipContent = tip.replace(/&nbsp;/g, '').replace(/<p>/g, '').replace(/<\/p>/g, '').trim();
        if (!tipContent.length) {
          return; // Empty tip
        } else {
          (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(this).addClass('h5p-has-tip');
        }

        // Add tip
        var $wrap = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<div/>', {
          'class': 'h5p-multichoice-tipwrap',
          'aria-label': params.UI.tipAvailable + '.'
        });
        var $multichoiceTip = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<div>', {
          'role': 'button',
          'tabindex': 0,
          'title': params.UI.tipsLabel,
          'aria-label': params.UI.tipsLabel,
          'aria-expanded': false,
          'class': 'multichoice-tip',
          appendTo: $wrap
        });
        var tipIconHtml = '<span class="joubel-icon-tip-normal">' + '<span class="h5p-icon-shadow"></span>' + '<span class="h5p-icon-speech-bubble"></span>' + '<span class="h5p-icon-info"></span>' + '</span>';
        $multichoiceTip.append(tipIconHtml);
        $multichoiceTip.click(function () {
          var $tipContainer = $multichoiceTip.parents('.h5p-answer');
          var openFeedback = !$tipContainer.children('.h5p-feedback-dialog').is($feedbackDialog);
          removeFeedbackDialog();

          // Do not open feedback if it was open
          if (openFeedback) {
            $multichoiceTip.attr('aria-expanded', true);

            // Add tip dialog
            addFeedback($tipContainer, tip);
            $feedbackDialog.addClass('h5p-has-tip');

            // Tip for readspeaker
            self.read(tip);
          } else {
            $multichoiceTip.attr('aria-expanded', false);
          }
          self.trigger('resize');

          // Remove tip dialog on dom click
          setTimeout(function () {
            $myDom.click(removeFeedbackDialog);
          }, 100);

          // Do not propagate
          return false;
        }).keydown(function (e) {
          if (e.which === 32) {
            (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(this).click();
            return false;
          }
        });
        (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-alternative-container', this).append($wrap);
      });

      // Set event listeners.
      var toggleCheck = function ($ans) {
        if ($ans.attr('aria-disabled') === 'true') {
          return;
        }
        self.answered = true;
        var num = parseInt($ans.data('id'));
        if (params.behaviour.singleAnswer) {
          // Store answer
          params.userAnswers = [num];

          // Calculate score
          score = params.answers[num].correct ? 1 : 0;

          // De-select previous answer
          $answers.not($ans).removeClass('h5p-selected').attr('tabindex', '-1').attr('aria-checked', 'false');

          // Select new answer
          $ans.addClass('h5p-selected').attr('tabindex', '0').attr('aria-checked', 'true');
        } else {
          if ($ans.attr('aria-checked') === 'true') {
            const pos = params.userAnswers.indexOf(num);
            if (pos !== -1) {
              params.userAnswers.splice(pos, 1);
            }

            // Do not allow un-checking when retry disabled and auto check
            if (params.behaviour.autoCheck && !params.behaviour.enableRetry) {
              return;
            }

            // Remove check
            $ans.removeClass('h5p-selected').attr('aria-checked', 'false');
          } else {
            params.userAnswers.push(num);
            $ans.addClass('h5p-selected').attr('aria-checked', 'true');
          }

          // Calculate score
          calcScore();
        }
        self.triggerXAPI('interacted');
        hideSolution($ans);
        if (params.userAnswers.length) {
          self.showButton('check-answer');
          self.hideButton('try-again');
          self.hideButton('show-solution');
          if (params.behaviour.autoCheck) {
            if (params.behaviour.singleAnswer) {
              // Only a single answer allowed
              checkAnswer();
            } else {
              // Show feedback for selected alternatives
              self.showCheckSolution(true);

              // Always finish task if it was completed successfully
              if (score === self.getMaxScore()) {
                checkAnswer();
              }
            }
          }
        }
      };
      $answers.click(function () {
        toggleCheck((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(this));
      }).keydown(function (e) {
        if (e.keyCode === 32) {
          // Space bar
          // Select current item
          toggleCheck((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(this));
          return false;
        }
        if (params.behaviour.singleAnswer) {
          switch (e.keyCode) {
            case 38: // Up
            case 37:
              {
                // Left
                // Try to select previous item
                var $prev = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(this).prev();
                if ($prev.length) {
                  toggleCheck($prev.focus());
                }
                return false;
              }
            case 40: // Down
            case 39:
              {
                // Right
                // Try to select next item
                var $next = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(this).next();
                if ($next.length) {
                  toggleCheck($next.focus());
                }
                return false;
              }
          }
        }
      });
      if (params.behaviour.singleAnswer) {
        // Special focus handler for radio buttons
        $answers.focus(function () {
          if ((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(this).attr('aria-disabled') !== 'true') {
            $answers.not(this).attr('tabindex', '-1');
          }
        }).blur(function () {
          if (!$answers.filter('.h5p-selected').length) {
            $answers.first().add($answers.last()).attr('tabindex', '0');
          }
        });
      }

      // Adds check and retry button
      addButtons();
      if (!params.behaviour.singleAnswer) {
        calcScore();
      } else {
        if (params.userAnswers.length && params.answers[params.userAnswers[0]].correct) {
          score = 1;
        } else {
          score = 0;
        }
      }

      // Has answered through auto-check in a previous session
      if (hasCheckedAnswer && params.behaviour.autoCheck) {
        // Check answers if answer has been given or max score reached
        if (params.behaviour.singleAnswer || score === self.getMaxScore()) {
          checkAnswer();
        } else {
          // Show feedback for checked checkboxes
          self.showCheckSolution(true);
        }
      }
    };
    this.showAllSolutions = function () {
      if (solutionsVisible) {
        return;
      }
      solutionsVisible = true;
      $myDom.find('.h5p-answer').each(function (i, e) {
        var $e = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(e);
        var a = params.answers[i];
        const className = 'h5p-solution-icon-' + (params.behaviour.singleAnswer ? 'radio' : 'checkbox');
        if (a.correct) {
          $e.addClass('h5p-should').append((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<span/>', {
            'class': className,
            html: params.UI.shouldCheck + '.'
          }));
        } else {
          $e.addClass('h5p-should-not').append((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<span/>', {
            'class': className,
            html: params.UI.shouldNotCheck + '.'
          }));
        }
      }).find('.h5p-question-plus-one, .h5p-question-minus-one').remove();

      // Make sure input is disabled in solution mode
      disableInput();

      // Move focus back to the first alternative so that the user becomes
      // aware that the solution is being shown.
      $myDom.find('.h5p-answer:first-child').focus();

      //Hide buttons and retry depending on settings.
      self.hideButton('check-answer');
      self.hideButton('show-solution');
      if (params.behaviour.enableRetry) {
        self.showButton('try-again');
      }
      self.trigger('resize');
    };

    /**
     * Used in contracts.
     * Shows the solution for the task and hides all buttons.
     */
    this.showSolutions = function () {
      removeFeedbackDialog();
      self.showCheckSolution();
      self.showAllSolutions();
      disableInput();
      self.hideButton('try-again');
    };

    /**
     * Hide solution for the given answer(s)
     *
     * @private
     * @param {jQuery} $answer
     */
    var hideSolution = function ($answer) {
      $answer.removeClass('h5p-correct').removeClass('h5p-wrong').removeClass('h5p-should').removeClass('h5p-should-not').removeClass('h5p-has-feedback').find('.h5p-question-plus-one, ' + '.h5p-question-minus-one, ' + '.h5p-answer-icon, ' + '.h5p-solution-icon-radio, ' + '.h5p-solution-icon-checkbox, ' + '.h5p-feedback-dialog').remove();
    };

    /**
     *
     */
    this.hideSolutions = function () {
      solutionsVisible = false;
      hideSolution((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-answer', $myDom));
      this.removeFeedback(); // Reset feedback

      self.trigger('resize');
    };

    /**
     * Resets the whole task.
     * Used in contracts with integrated content.
     * @private
     */
    this.resetTask = function () {
      self.answered = false;
      self.hideSolutions();
      params.userAnswers = [];
      removeSelections();
      self.showButton('check-answer');
      self.hideButton('try-again');
      self.hideButton('show-solution');
      enableInput();
      $myDom.find('.h5p-feedback-available').remove();
    };
    var calculateMaxScore = function () {
      if (blankIsCorrect) {
        return params.weight;
      }
      var maxScore = 0;
      for (var i = 0; i < params.answers.length; i++) {
        var choice = params.answers[i];
        if (choice.correct) {
          maxScore += choice.weight !== undefined ? choice.weight : 1;
        }
      }
      return maxScore;
    };
    this.getMaxScore = function () {
      return !params.behaviour.singleAnswer && !params.behaviour.singlePoint ? calculateMaxScore() : params.weight;
    };

    /**
     * Check answer
     */
    var checkAnswer = function () {
      // Unbind removal of feedback dialogs on click
      $myDom.unbind('click', removeFeedbackDialog);

      // Remove all tip dialogs
      removeFeedbackDialog();
      if (params.behaviour.enableSolutionsButton) {
        self.showButton('show-solution');
      }
      if (params.behaviour.enableRetry) {
        self.showButton('try-again');
      }
      self.hideButton('check-answer');
      self.showCheckSolution();
      disableInput();
      var xAPIEvent = self.createXAPIEventTemplate('answered');
      addQuestionToXAPI(xAPIEvent);
      addResponseToXAPI(xAPIEvent);
      self.trigger(xAPIEvent);
    };

    /**
     * Adds the ui buttons.
     * @private
     */
    var addButtons = function () {
      var $content = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('[data-content-id="' + self.contentId + '"].h5p-content');
      var $containerParents = $content.parents('.h5p-container');

      // select find container to attach dialogs to
      var $container;
      if ($containerParents.length !== 0) {
        // use parent highest up if any
        $container = $containerParents.last();
      } else if ($content.length !== 0) {
        $container = $content;
      } else {
        $container = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(document.body);
      }

      // Show solution button
      self.addButton('show-solution', params.UI.showSolutionButton, function () {
        if (params.behaviour.showSolutionsRequiresInput && !self.getAnswerGiven(true)) {
          // Require answer before solution can be viewed
          self.updateFeedbackContent(params.UI.noInput);
          self.read(params.UI.noInput);
        } else {
          calcScore();
          self.showAllSolutions();
        }
      }, false, {
        'aria-label': params.UI.a11yShowSolution
      });

      // Check button
      if (params.behaviour.enableCheckButton && (!params.behaviour.autoCheck || !params.behaviour.singleAnswer)) {
        self.addButton('check-answer', params.UI.checkAnswerButton, function () {
          self.answered = true;
          checkAnswer();
          $myDom.find('.h5p-answer:first-child').focus();
        }, true, {
          'aria-label': params.UI.a11yCheck
        }, {
          confirmationDialog: {
            enable: params.behaviour.confirmCheckDialog,
            l10n: params.confirmCheck,
            instance: self,
            $parentElement: $container
          },
          contentData: self.contentData,
          textIfSubmitting: params.UI.submitAnswerButton
        });
      }

      // Try Again button
      self.addButton('try-again', params.UI.tryAgainButton, function () {
        self.resetTask();
        if (params.behaviour.randomAnswers) {
          // reshuffle answers
          var oldIdMap = idMap;
          idMap = getShuffleMap();
          var answersDisplayed = $myDom.find('.h5p-answer');
          // remember tips
          var tip = [];
          for (i = 0; i < answersDisplayed.length; i++) {
            tip[i] = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(answersDisplayed[i]).find('.h5p-multichoice-tipwrap');
          }
          // Those two loops cannot be merged or you'll screw up your tips
          for (i = 0; i < answersDisplayed.length; i++) {
            // move tips and answers on display
            (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(answersDisplayed[i]).find('.h5p-alternative-inner').html(params.answers[i].text);
            (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(tip[i]).detach().appendTo((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(answersDisplayed[idMap.indexOf(oldIdMap[i])]).find('.h5p-alternative-container'));
          }
        }
      }, false, {
        'aria-label': params.UI.a11yRetry
      }, {
        confirmationDialog: {
          enable: params.behaviour.confirmRetryDialog,
          l10n: params.confirmRetry,
          instance: self,
          $parentElement: $container
        }
      });
    };

    /**
     * Determine which feedback text to display
     *
     * @param {number} score
     * @param {number} max
     * @return {string}
     */
    var getFeedbackText = function (score, max) {
      var ratio = score / max;
      var feedback = _globals__WEBPACK_IMPORTED_MODULE_0__.Question.determineOverallFeedback(params.overallFeedback, ratio);
      return feedback.replace('@score', score).replace('@total', max);
    };

    /**
     * Shows feedback on the selected fields.
     * @public
     * @param {boolean} [skipFeedback] Skip showing feedback if true
     */
    this.showCheckSolution = function (skipFeedback) {
      var scorePoints;
      if (!(params.behaviour.singleAnswer || params.behaviour.singlePoint || !params.behaviour.showScorePoints)) {
        scorePoints = new _globals__WEBPACK_IMPORTED_MODULE_0__.Question.ScorePoints();
      }
      $myDom.find('.h5p-answer').each(function (i, e) {
        var $e = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(e);
        var a = params.answers[i];
        var chosen = $e.attr('aria-checked') === 'true';
        if (chosen) {
          if (a.correct) {
            // May already have been applied by instant feedback
            if (!$e.hasClass('h5p-correct')) {
              $e.addClass('h5p-correct').append((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<span/>', {
                'class': 'h5p-answer-icon',
                html: params.UI.correctAnswer + '.'
              }));
            }
          } else {
            if (!$e.hasClass('h5p-wrong')) {
              $e.addClass('h5p-wrong').append((0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<span/>', {
                'class': 'h5p-answer-icon',
                html: params.UI.wrongAnswer + '.'
              }));
            }
          }
          if (scorePoints) {
            var alternativeContainer = $e[0].querySelector('.h5p-alternative-container');
            if (!params.behaviour.autoCheck || alternativeContainer.querySelector('.h5p-question-plus-one, .h5p-question-minus-one') === null) {
              alternativeContainer.appendChild(scorePoints.getElement(a.correct));
            }
          }
        }
        if (!skipFeedback) {
          if (chosen && a.tipsAndFeedback.chosenFeedback !== undefined && a.tipsAndFeedback.chosenFeedback !== '') {
            addFeedback($e, a.tipsAndFeedback.chosenFeedback);
          } else if (!chosen && a.tipsAndFeedback.notChosenFeedback !== undefined && a.tipsAndFeedback.notChosenFeedback !== '') {
            addFeedback($e, a.tipsAndFeedback.notChosenFeedback);
          }
        }
      });

      // Determine feedback
      var max = self.getMaxScore();

      // Disable task if maxscore is achieved
      var fullScore = score === max;
      if (fullScore) {
        self.hideButton('check-answer');
        self.hideButton('try-again');
        self.hideButton('show-solution');
      }

      // Show feedback
      if (!skipFeedback) {
        this.setFeedback(getFeedbackText(score, max), score, max, params.UI.scoreBarLabel);
      }
      self.trigger('resize');
    };

    /**
     * Disables choosing new input.
     */
    var disableInput = function () {
      (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-answer', $myDom).attr({
        'aria-disabled': 'true',
        'tabindex': '-1'
      }).removeAttr('role').removeAttr('aria-checked');
      (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-answers').removeAttr('role');
    };

    /**
     * Enables new input.
     */
    var enableInput = function () {
      (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-answer', $myDom).attr({
        'aria-disabled': 'false',
        'role': params.behaviour.singleAnswer ? 'radio' : 'checkbox'
      });
      (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-answers').attr('role', params.role);
    };
    var calcScore = function () {
      score = 0;
      for (const answer of params.userAnswers) {
        const choice = params.answers[answer];
        const weight = choice.weight !== undefined ? choice.weight : 1;
        if (choice.correct) {
          score += weight;
        } else {
          score -= weight;
        }
      }
      if (score < 0) {
        score = 0;
      }
      if (!params.userAnswers.length && blankIsCorrect) {
        score = params.weight;
      }
      if (params.behaviour.singlePoint) {
        score = 100 * score / calculateMaxScore() >= params.behaviour.passPercentage ? params.weight : 0;
      }
    };

    /**
     * Removes selections from task.
     */
    var removeSelections = function () {
      var $answers = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('.h5p-answer', $myDom).removeClass('h5p-selected').attr('aria-checked', 'false');
      if (!params.behaviour.singleAnswer) {
        $answers.attr('tabindex', '0');
      } else {
        $answers.first().attr('tabindex', '0');
      }

      // Set focus to first option
      $answers.first().focus();
      calcScore();
    };

    /**
     * Get xAPI data.
     * Contract used by report rendering engine.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     */
    this.getXAPIData = function () {
      var xAPIEvent = this.createXAPIEventTemplate('answered');
      addQuestionToXAPI(xAPIEvent);
      addResponseToXAPI(xAPIEvent);
      return {
        statement: xAPIEvent.data.statement
      };
    };

    /**
     * Add the question itself to the definition part of an xAPIEvent
     */
    var addQuestionToXAPI = function (xAPIEvent) {
      var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
      definition.description = {
        // Remove tags, must wrap in div tag because jQuery 1.9 will crash if the string isn't wrapped in a tag.
        'en-US': (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<div>' + params.question + '</div>').text()
      };
      definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.interactionType = 'choice';
      definition.correctResponsesPattern = [];
      definition.choices = [];
      for (var i = 0; i < params.answers.length; i++) {
        definition.choices[i] = {
          'id': params.answers[i].originalOrder + '',
          'description': {
            // Remove tags, must wrap in div tag because jQuery 1.9 will crash if the string isn't wrapped in a tag.
            'en-US': (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)('<div>' + params.answers[i].text + '</div>').text()
          }
        };
        if (params.answers[i].correct) {
          if (!params.singleAnswer) {
            if (definition.correctResponsesPattern.length) {
              definition.correctResponsesPattern[0] += '[,]';
              // This looks insane, but it's how you separate multiple answers
              // that must all be chosen to achieve perfect score...
            } else {
              definition.correctResponsesPattern.push('');
            }
            definition.correctResponsesPattern[0] += params.answers[i].originalOrder;
          } else {
            definition.correctResponsesPattern.push('' + params.answers[i].originalOrder);
          }
        }
      }
    };

    /**
     * Add the response part to an xAPI event
     *
     * @param {XAPIEvent} xAPIEvent
     *  The xAPI event we will add a response to
     */
    var addResponseToXAPI = function (xAPIEvent) {
      var maxScore = self.getMaxScore();
      var success = 100 * score / maxScore >= params.behaviour.passPercentage;
      xAPIEvent.setScoredResult(score, maxScore, self, true, success);
      if (params.userAnswers === undefined) {
        calcScore();
      }

      // Add the response
      var response = '';
      for (var i = 0; i < params.userAnswers.length; i++) {
        if (response !== '') {
          response += '[,]';
        }
        response += idMap === undefined ? params.userAnswers[i] : idMap[params.userAnswers[i]];
      }
      xAPIEvent.data.statement.result.response = response;
    };

    /**
     * Create a map pointing from original answers to shuffled answers
     *
     * @return {number[]} map pointing from original answers to shuffled answers
     */
    var getShuffleMap = function () {
      params.answers = (0,_globals__WEBPACK_IMPORTED_MODULE_0__.shuffleArray)(params.answers);

      // Create a map from the new id to the old one
      var idMap = [];
      for (i = 0; i < params.answers.length; i++) {
        idMap[i] = params.answers[i].originalOrder;
      }
      return idMap;
    };

    // Initialization code
    // Randomize order, if requested
    var idMap;
    // Store original order in answers
    for (i = 0; i < params.answers.length; i++) {
      params.answers[i].originalOrder = i;
    }
    if (params.behaviour.randomAnswers) {
      idMap = getShuffleMap();
    }

    // Start with an empty set of user answers.
    params.userAnswers = [];

    // Restore previous state
    if (contentData && contentData.previousState !== undefined) {
      // Restore answers
      if (contentData.previousState.answers) {
        if (!idMap) {
          params.userAnswers = contentData.previousState.answers;
        } else {
          // The answers have been shuffled, and we must use the id mapping.
          for (i = 0; i < contentData.previousState.answers.length; i++) {
            for (var k = 0; k < idMap.length; k++) {
              if (idMap[k] === contentData.previousState.answers[i]) {
                params.userAnswers.push(k);
              }
            }
          }
        }
        calcScore();
      }
    }
    var hasCheckedAnswer = false;

    // Loop through choices
    for (var j = 0; j < params.answers.length; j++) {
      var ans = params.answers[j];
      if (!params.behaviour.singleAnswer) {
        // Set role
        ans.role = 'checkbox';
        ans.tabindex = '0';
        if (params.userAnswers.indexOf(j) !== -1) {
          ans.checked = 'true';
          hasCheckedAnswer = true;
        }
      } else {
        // Set role
        ans.role = 'radio';

        // Determine tabindex, checked and extra classes
        if (params.userAnswers.length === 0) {
          // No correct answers
          if (i === 0 || i === params.answers.length) {
            ans.tabindex = '0';
          }
        } else if (params.userAnswers.indexOf(j) !== -1) {
          // This is the correct choice
          ans.tabindex = '0';
          ans.checked = 'true';
          hasCheckedAnswer = true;
        }
      }

      // Set default
      if (ans.tabindex === undefined) {
        ans.tabindex = '-1';
      }
      if (ans.checked === undefined) {
        ans.checked = 'false';
      }
    }
    MusicNotationMultiChoice.counter = MusicNotationMultiChoice.counter === undefined ? 0 : MusicNotationMultiChoice.counter + 1;
    params.role = params.behaviour.singleAnswer ? 'radiogroup' : 'group';
    params.labelId = 'h5p-mcq' + MusicNotationMultiChoice.counter;

    /**
     * Pack the current state of the interactivity into a object that can be
     * serialized.
     *
     * @public
     */
    this.getCurrentState = function () {
      var state = {};
      if (!idMap) {
        state.answers = params.userAnswers;
      } else {
        // The answers have been shuffled and must be mapped back to their
        // original ID.
        state.answers = [];
        for (var i = 0; i < params.userAnswers.length; i++) {
          state.answers.push(idMap[params.userAnswers[i]]);
        }
      }
      return state;
    };

    /**
     * Check if user has given an answer.
     *
     * @param {boolean} [ignoreCheck] Ignore returning true from pressing "check-answer" button.
     * @return {boolean} True if answer is given
     */
    this.getAnswerGiven = function (ignoreCheck) {
      var answered = ignoreCheck ? false : this.answered;
      return answered || params.userAnswers.length > 0 || blankIsCorrect;
    };
    this.getScore = function () {
      return score;
    };
    this.getTitle = function () {
      return H5P.createTitle(this.contentData && this.contentData.metadata && this.contentData.metadata.title ? this.contentData.metadata.title : 'Multiple Choice');
    };
    (0,_globals__WEBPACK_IMPORTED_MODULE_0__.jQuery)(self.loadObservers(params));
  }
  ;
  MusicNotationMultiChoice.prototype = Object.create(_globals__WEBPACK_IMPORTED_MODULE_0__.Question.prototype);
  MusicNotationMultiChoice.prototype.constructor = MusicNotationMultiChoice;
  function sanitizeXMLString(xml) {
    return xml.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
  }

  /**
  * Notation logic
  */

  /**
  * Load obeservers for changes in the dom, so that parameters of the vibe can be updated 
  */
  MusicNotationMultiChoice.prototype.loadObservers = function (params) {
    var that = this;
    this.instancePassed = false;
    // do all the important vibe stuff, when vibe is properly loaded and attached
    var domAttachObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.from(mutation.addedNodes).forEach(an => {
          if (an.constructor.name.toLowerCase().includes("element")) {
            if (an.classList.contains("h5p-question-content") && an.parentElement.classList.contains("h5p-multichoice")) {
              if (an.parentElement.querySelector(".h5p-vibe-container") === null && !that.instancePassed) {
                that.instancePassed = true;
                var vibeContainerDiv = document.createElement("div");
                vibeContainerDiv.classList.add("h5p-vibe-container");
                an.parentNode.insertBefore(vibeContainerDiv, an);
                that.loadSVG(params);
              }
            } else if (an.classList.contains("notation")) {
              that.adjustFrame(an);
            }
          }
        });
      });
    });
    domAttachObserver.observe(document, {
      childList: true,
      subtree: true
    });
  };

  /**
   * Loads SVG from parameters
   * params must contain:
   * - params.question_notation_list
   * - params.answers[i].answer_notation
   * @param {*} params 
   */
  MusicNotationMultiChoice.prototype.loadSVG = async function (params) {
    var that = this;
    var rootContainer;
    if (params.question_instance_num != undefined) {
      rootContainer = window.document.querySelectorAll(".question-container")[params.question_instance_num];
      if (rootContainer.getAttribute("instance-id") === null) {
        rootContainer.setAttribute("instance-id", params.question_instance_num);
        // that.activeQuestionContainerObserver.observe(rootContainer, {
        //   attributes: true
        // })
      } else {
        //if(rootContainer.getAttribute("instance-id") == params.question_instance_num) return
      }
    } else {
      rootContainer = window.document.body;
    }
    var question_container = rootContainer.querySelector(".h5p-vibe-container");
    //this will prevent loading non visible containers (e.g. in question set, vibe-containers will appear on different slides)
    // if (rootContainer.closest(".question-container[style='display: none;'") !== null) return
    // if (rootContainer.querySelector(".vibe-container") !== null) return
    if (params.question_notation_list != undefined) {
      for (var i = 0; i < params.question_notation_list.length; i++) {
        if (!params.question_notation_list[i].notationWidget.includes("&lt;/svg")) continue; // The box for the notation is initialized but it has no parsable string. Just checking if svg tag exists
        var $vibeQuestion = document.createElement("div");
        $vibeQuestion.setAttribute("id", 'vibeChoice' + this.generateUID());
        $vibeQuestion.classList.add("notation");
        var svgout = new DOMParser().parseFromString(sanitizeXMLString(params.question_notation_list[i].notationWidget), "text/html").body.firstChild;
        svgout.querySelectorAll("#manipulatorCanvas, #scoreRects, #labelCanvas, #phantomCanvas").forEach(c => c.remove());
        svgout.querySelectorAll(".marked, .lastAdded").forEach(m => {
          m.classList.remove("marked");
          m.classList.remove("lastAdded");
        });
        //svgout.querySelectorAll("svg").forEach(svg => svg.style.transform = "scale(2.5)")
        $vibeQuestion.append(svgout);
        question_container.appendChild($vibeQuestion);
      }
    }
    for (var i = 0; i < params.answers.length; i++) {
      if (params.answers[i].answer_notation != undefined) {
        if (!this.isEmptyMEI(params.answers[i].answer_notation.notationWidget)) {
          var uuid = this.generateUID();
          var $vibeAnswer = document.createElement("div");
          $vibeAnswer.setAttribute("id", 'vibeAnswer' + uuid);
          $vibeAnswer.classList.add("notation");
          var answerContainer = rootContainer.querySelector(".h5p-alternative-container[answer-id='" + i.toString() + "'");
          var svgout = new DOMParser().parseFromString(sanitizeXMLString(params.answers[i].answer_notation.notationWidget), "text/html").body.firstChild;
          svgout.querySelectorAll("#manipulatorCanvas, #scoreRects, #labelCanvas, #phantomCanvas").forEach(c => c.remove());
          svgout.querySelectorAll(".marked, .lastAdded").forEach(m => {
            m.classList.remove("marked");
            m.classList.remove("lastAdded");
          });
          //svgout.querySelectorAll("svg").forEach(svg => svg.style.transform = "scale(2.5)")
          $vibeAnswer.append(svgout);
          answerContainer.appendChild($vibeAnswer);
        }
      }
    }
    return this.vibeInstances;
  };

  /**
     * Adjust sizes according to definition-scale height of contents when all necessary containers are loaded.
     */
  MusicNotationMultiChoice.prototype.adjustFrame = function (vibeContainer) {
    var containerSVG = vibeContainer.querySelector("#svgContainer");
    if (containerSVG !== null) {
      // var vb = containerSVG.querySelector("#interactionOverlay").getAttribute("viewBox")?.split(" ").map(parseFloat)
      // containerHeight = (vb[3] * 1.25).toString() + "px"
      // containerSVG.style.overflow = "auto"

      if (this.taskContainerHeight === 0) {
        Array.from(containerSVG.children).forEach(c => {
          if (c.id === "sidebarContainer") return;
          if (c.id === "interactionOverlay") {
            if (Array.from(c.children).every(child => child.children.length === 0)) return;
          }
          this.taskContainerHeight += c.getBoundingClientRect().height;
        });
      }
    }
    vibeContainer.style.height = this.taskContainerHeight * 1.3 + "px"; //containerHeight || "20rem"
    vibeContainer.style.width = "100%";

    // var h5pContainer = vibeContainer.parentElement //document.querySelector(".h5p-vibe-container")
    // var showChildren = h5pContainer.querySelectorAll(".vibe-container")
    // var h5pContainerHeight = parseFloat(h5pContainer.style.heigth) || 0
    // showChildren.forEach(sc => {
    //   h5pContainerHeight += sc.getBoundingClientRect().height
    //   sc.style.position = "relative" // very important, so that the containers are displayed in the same column
    // })
    // h5pContainer.style.height = h5pContainerHeight.toString() + "px"
    // window.frameElement.style.height = (parseFloat(window.frameElement.style.height) + h5pContainerHeight / 1).toString() + "px"
  };

  /**
   * Check if given MEI is just empty.
   * Empty means: Only one layer with one mRest. This is the default notation setup without changing anything.
   * @param {*} mei 
   * @returns 
   */
  MusicNotationMultiChoice.prototype.isEmptyMEI = function (mei) {
    //convert string for proper parsing
    if (!mei) return true;
    mei = mei.replace(/\n/g, ""); // delete all unnecessary newline
    mei = mei.replace(/\s{2,}/g, ""); // delete all unnecessary whitespaces
    mei = mei.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(mei, "text/xml");
    return xmlDoc.querySelectorAll("layer").length === 1 && xmlDoc.querySelector("layer mRest") !== null;
  };
  MusicNotationMultiChoice.prototype.generateUID = function () {
    var firstPart = (Math.random() * 46656 | 0).toString(36);
    var secondPart = (Math.random() * 46656 | 0).toString(36);
    firstPart = ("000" + firstPart).slice(-3);
    secondPart = ("000" + secondPart).slice(-3);
    return firstPart + secondPart;
  };
  return MusicNotationMultiChoice;
}();
/* harmony default export */ __webpack_exports__["default"] = (MNMC);

/***/ }),

/***/ "./css/musicnotation-multichoice.css":
/*!*******************************************!*\
  !*** ./css/musicnotation-multichoice.css ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./entries/entry.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_musicnotation_multichoice_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/musicnotation-multichoice.css */ "./css/musicnotation-multichoice.css");
/* harmony import */ var _js_musicnotation_multichoice_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../js/musicnotation-multichoice.js */ "./js/musicnotation-multichoice.js");



// Load library
H5P = H5P || {};
H5P.MusicNotationMultiChoice = _js_musicnotation_multichoice_js__WEBPACK_IMPORTED_MODULE_1__["default"];
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ042QztBQUNROztBQUVyRDtBQUNBUCxHQUFHLEdBQUdBLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDZkEsR0FBRyxDQUFDUSx3QkFBd0IsR0FBR0Qsd0VBQUksQyIsInNvdXJjZXMiOlsid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2UvLi9qcy9nbG9iYWxzLmpzIiwid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2UvLi9qcy9tdXNpY25vdGF0aW9uLW11bHRpY2hvaWNlLmpzIiwid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2UvLi9jc3MvbXVzaWNub3RhdGlvbi1tdWx0aWNob2ljZS5jc3MiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9tdXNpY25vdGF0aW9uX211bHRpY2hvaWNlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9tdXNpY25vdGF0aW9uX211bHRpY2hvaWNlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2UvLi9lbnRyaWVzL2VudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBFdmVudERpc3BhdGNoZXIgPSBINVAuRXZlbnREaXNwYXRjaGVyO1xuZXhwb3J0IGNvbnN0IGpRdWVyeSA9IEg1UC5qUXVlcnk7XG5leHBvcnQgY29uc3QgSm91YmVsVUkgPSBINVAuSm91YmVsVUk7XG5leHBvcnQgY29uc3QgUXVlc3Rpb24gPSBINVAuUXVlc3Rpb247XG5leHBvcnQgY29uc3Qgc2h1ZmZsZUFycmF5ID0gSDVQLnNodWZmbGVBcnJheTsiLCIvLyBXaWxsIHJlbmRlciBhIFF1ZXN0aW9uIHdpdGggbXVsdGlwbGUgY2hvaWNlcyBmb3IgYW5zd2Vycy5cbi8vIE9wdGlvbnMgZm9ybWF0OlxuLy8ge1xuLy8gICB0aXRsZTogXCJPcHRpb25hbCB0aXRsZSBmb3IgcXVlc3Rpb24gYm94XCIsXG4vLyAgIHF1ZXN0aW9uOiBcIlF1ZXN0aW9uIHRleHRcIixcbi8vICAgYW5zd2VyczogW3t0ZXh0OiBcIkFuc3dlciB0ZXh0XCIsIGNvcnJlY3Q6IGZhbHNlfSwgLi4uXSxcbi8vICAgc2luZ2xlQW5zd2VyOiB0cnVlLCAvLyBvciBmYWxzZSwgd2lsbCBjaGFuZ2UgcmVuZGVyZWQgb3V0cHV0IHNsaWdodGx5LlxuLy8gICBzaW5nbGVQb2ludDogdHJ1ZSwgIC8vIFRydWUgaWYgcXVlc3Rpb24gZ2l2ZSBhIHNpbmdsZSBwb2ludCBzY29yZSBvbmx5XG4vLyAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgYWxsIGFyZSBjb3JyZWN0LCBmYWxzZSB0byBnaXZlIDEgcG9pbnQgcGVyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgLy8gY29ycmVjdCBhbnN3ZXIuIChPbmx5IGZvciBzaW5nbGVBbnN3ZXI9ZmFsc2UpXG4vLyAgIHJhbmRvbUFuc3dlcnM6IGZhbHNlICAvLyBXaGV0aGVyIHRvIHJhbmRvbWl6ZSB0aGUgb3JkZXIgb2YgYW5zd2Vycy5cbi8vIH1cbi8vXG4vLyBFdmVudHMgcHJvdmlkZWQ6XG4vLyAtIGg1cFF1ZXN0aW9uQW5zd2VyZWQ6IFRyaWdnZXJlZCB3aGVuIGEgcXVlc3Rpb24gaGFzIGJlZW4gYW5zd2VyZWQuXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gT3B0aW9uc1xuICogICBPcHRpb25zIGZvciBtdWx0aXBsZSBjaG9pY2VcbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gYmVoYXZpb3VyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGJlaGF2aW91ci5jb25maXJtQ2hlY2tEaWFsb2dcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gYmVoYXZpb3VyLmNvbmZpcm1SZXRyeURpYWxvZ1xuICpcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBVSVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFVJLnRpcHNMYWJlbFxuICpcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBbY29uZmlybVJldHJ5XVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtUmV0cnkuaGVhZGVyXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtUmV0cnkuYm9keV1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybVJldHJ5LmNhbmNlbExhYmVsXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtUmV0cnkuY29uZmlybUxhYmVsXVxuICpcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBbY29uZmlybUNoZWNrXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtQ2hlY2suaGVhZGVyXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtQ2hlY2suYm9keV1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybUNoZWNrLmNhbmNlbExhYmVsXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtQ2hlY2suY29uZmlybUxhYmVsXVxuICovXG5cbi8qKlxuICogTW9kdWxlIGZvciBjcmVhdGluZyBhIG11bHRpcGxlIGNob2ljZSBxdWVzdGlvblxuICpcbiAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9uc1xuICogQHBhcmFtIHtudW1iZXJ9IGNvbnRlbnRJZFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnREYXRhXG4gKiBAcmV0dXJucyB7TXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cblxuLy9pbXBvcnQgVklCRSBmcm9tIFwidmVyb3Zpb3Njb3JlZWRpdG9yXCI7XG5pbXBvcnQge1xuICBqUXVlcnkgYXMgJCwgSm91YmVsVUkgYXMgVUksIFF1ZXN0aW9uLCBzaHVmZmxlQXJyYXlcbn1cbiAgZnJvbSBcIi4vZ2xvYmFsc1wiO1xuXG5jb25zdCBNTk1DID0gKGZ1bmN0aW9uICgpIHtcblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zIFxuICAgKiBAcGFyYW0geyp9IGNvbnRlbnRJZCBcbiAgICogQHBhcmFtIHsqfSBjb250ZW50RGF0YSBcbiAgICogQHJldHVybnMgXG4gICAqL1xuICBmdW5jdGlvbiBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2Uob3B0aW9ucywgY29udGVudElkLCBjb250ZW50RGF0YSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UpKVxuICAgICAgcmV0dXJuIG5ldyBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2Uob3B0aW9ucywgY29udGVudElkLCBjb250ZW50RGF0YSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuY29udGVudElkID0gY29udGVudElkO1xuICAgIHRoaXMuY29udGVudERhdGEgPSBjb250ZW50RGF0YTtcbiAgICBRdWVzdGlvbi5jYWxsKHNlbGYsICdtdWx0aWNob2ljZScpO1xuICAgIHRoaXMudGFza0NvbnRhaW5lckhlaWdodCA9IDBcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIGltYWdlOiBudWxsLFxuICAgICAgcXVlc3Rpb246IFwiTm8gcXVlc3Rpb24gdGV4dCBwcm92aWRlZFwiLFxuICAgICAgYW5zd2VyczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGlwc0FuZEZlZWRiYWNrOiB7XG4gICAgICAgICAgICB0aXA6ICcnLFxuICAgICAgICAgICAgY2hvc2VuRmVlZGJhY2s6ICcnLFxuICAgICAgICAgICAgbm90Q2hvc2VuRmVlZGJhY2s6ICcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0ZXh0OiBcIkFuc3dlciAxXCIsXG4gICAgICAgICAgY29ycmVjdDogdHJ1ZVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgb3ZlcmFsbEZlZWRiYWNrOiBbXSxcbiAgICAgIHdlaWdodDogMSxcbiAgICAgIHVzZXJBbnN3ZXJzOiBbXSxcbiAgICAgIFVJOiB7XG4gICAgICAgIGNoZWNrQW5zd2VyQnV0dG9uOiAnQ2hlY2snLFxuICAgICAgICBzdWJtaXRBbnN3ZXJCdXR0b246ICdTdWJtaXQnLFxuICAgICAgICBzaG93U29sdXRpb25CdXR0b246ICdTaG93IHNvbHV0aW9uJyxcbiAgICAgICAgdHJ5QWdhaW5CdXR0b246ICdUcnkgYWdhaW4nLFxuICAgICAgICBzY29yZUJhckxhYmVsOiAnWW91IGdvdCA6bnVtIG91dCBvZiA6dG90YWwgcG9pbnRzJyxcbiAgICAgICAgdGlwQXZhaWxhYmxlOiBcIlRpcCBhdmFpbGFibGVcIixcbiAgICAgICAgZmVlZGJhY2tBdmFpbGFibGU6IFwiRmVlZGJhY2sgYXZhaWxhYmxlXCIsXG4gICAgICAgIHJlYWRGZWVkYmFjazogJ1JlYWQgZmVlZGJhY2snLFxuICAgICAgICBzaG91bGRDaGVjazogXCJTaG91bGQgaGF2ZSBiZWVuIGNoZWNrZWRcIixcbiAgICAgICAgc2hvdWxkTm90Q2hlY2s6IFwiU2hvdWxkIG5vdCBoYXZlIGJlZW4gY2hlY2tlZFwiLFxuICAgICAgICBub0lucHV0OiAnSW5wdXQgaXMgcmVxdWlyZWQgYmVmb3JlIHZpZXdpbmcgdGhlIHNvbHV0aW9uJyxcbiAgICAgICAgYTExeUNoZWNrOiAnQ2hlY2sgdGhlIGFuc3dlcnMuIFRoZSByZXNwb25zZXMgd2lsbCBiZSBtYXJrZWQgYXMgY29ycmVjdCwgaW5jb3JyZWN0LCBvciB1bmFuc3dlcmVkLicsXG4gICAgICAgIGExMXlTaG93U29sdXRpb246ICdTaG93IHRoZSBzb2x1dGlvbi4gVGhlIHRhc2sgd2lsbCBiZSBtYXJrZWQgd2l0aCBpdHMgY29ycmVjdCBzb2x1dGlvbi4nLFxuICAgICAgICBhMTF5UmV0cnk6ICdSZXRyeSB0aGUgdGFzay4gUmVzZXQgYWxsIHJlc3BvbnNlcyBhbmQgc3RhcnQgdGhlIHRhc2sgb3ZlciBhZ2Fpbi4nLFxuICAgICAgfSxcbiAgICAgIGJlaGF2aW91cjoge1xuICAgICAgICBlbmFibGVSZXRyeTogdHJ1ZSxcbiAgICAgICAgZW5hYmxlU29sdXRpb25zQnV0dG9uOiB0cnVlLFxuICAgICAgICBlbmFibGVDaGVja0J1dHRvbjogdHJ1ZSxcbiAgICAgICAgdHlwZTogJ2F1dG8nLFxuICAgICAgICBzaW5nbGVQb2ludDogdHJ1ZSxcbiAgICAgICAgcmFuZG9tQW5zd2VyczogZmFsc2UsXG4gICAgICAgIHNob3dTb2x1dGlvbnNSZXF1aXJlc0lucHV0OiB0cnVlLFxuICAgICAgICBhdXRvQ2hlY2s6IGZhbHNlLFxuICAgICAgICBwYXNzUGVyY2VudGFnZTogMTAwLFxuICAgICAgICBzaG93U2NvcmVQb2ludHM6IHRydWVcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBwYXJhbXMgPSAkLmV4dGVuZCh0cnVlLCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICBjb25zb2xlLmxvZyhcIk11bHRpY2hvaWNlXCIsIHBhcmFtcylcblxuICAgIC8vYXJyYXkgb2YgY29udGFpbmVycy4gd2lsbCBiZSB1c2VkIGZvciBzY2FsaW5nIGxhdGVyXG4gICAgLy8gdGhpcy52aWJlQ29udGFpbmVyID0gW11cbiAgICAvLyB0aGlzLnZpYmVJbnN0YW5jZXMgPSBbXVxuXG4gICAgLy8gS2VlcCB0cmFjayBvZiBudW1iZXIgb2YgY29ycmVjdCBjaG9pY2VzXG4gICAgdmFyIG51bUNvcnJlY3QgPSAwO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGNob2ljZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYW5zd2VyID0gcGFyYW1zLmFuc3dlcnNbaV07XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aXBzIGFuZCBmZWVkYmFjayBleGlzdHNcbiAgICAgIGFuc3dlci50aXBzQW5kRmVlZGJhY2sgPSBhbnN3ZXIudGlwc0FuZEZlZWRiYWNrIHx8IHt9O1xuXG4gICAgICBpZiAocGFyYW1zLmFuc3dlcnNbaV0uY29ycmVjdCkge1xuICAgICAgICAvLyBVcGRhdGUgbnVtYmVyIG9mIGNvcnJlY3QgY2hvaWNlc1xuICAgICAgICBudW1Db3JyZWN0Kys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIG5vIGNob2ljZXMgaXMgdGhlIGNvcnJlY3RcbiAgICB2YXIgYmxhbmtJc0NvcnJlY3QgPSAobnVtQ29ycmVjdCA9PT0gMCk7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGFzayB0eXBlXG4gICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIudHlwZSA9PT0gJ2F1dG8nKSB7XG4gICAgICAvLyBVc2Ugc2luZ2xlIGNob2ljZSBpZiBvbmx5IG9uZSBjaG9pY2UgaXMgY29ycmVjdFxuICAgICAgcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPSAobnVtQ29ycmVjdCA9PT0gMSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPSAocGFyYW1zLmJlaGF2aW91ci50eXBlID09PSAnc2luZ2xlJyk7XG4gICAgfVxuXG4gICAgdmFyIGdldENoZWNrYm94T3JSYWRpb0ljb24gPSBmdW5jdGlvbiAocmFkaW8sIHNlbGVjdGVkKSB7XG4gICAgICB2YXIgaWNvbjtcbiAgICAgIGlmIChyYWRpbykge1xuICAgICAgICBpY29uID0gc2VsZWN0ZWQgPyAnJiN4ZTYwMzsnIDogJyYjeGU2MDA7JztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpY29uID0gc2VsZWN0ZWQgPyAnJiN4ZTYwMTsnIDogJyYjeGU2MDI7JztcbiAgICAgIH1cbiAgICAgIHJldHVybiBpY29uO1xuICAgIH07XG5cbiAgICAvLyBJbml0aWFsaXplIGJ1dHRvbnMgYW5kIGVsZW1lbnRzLlxuICAgIHZhciAkbXlEb207XG4gICAgdmFyICRmZWVkYmFja0RpYWxvZztcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgZmVlZGJhY2sgZGlhbG9nc1xuICAgICAqL1xuICAgIHZhciByZW1vdmVGZWVkYmFja0RpYWxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgb3BlbiBmZWVkYmFjayBkaWFsb2dzLlxuICAgICAgJG15RG9tLnVuYmluZCgnY2xpY2snLCByZW1vdmVGZWVkYmFja0RpYWxvZyk7XG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1mZWVkYmFjay1idXR0b24sIC5oNXAtZmVlZGJhY2stZGlhbG9nJykucmVtb3ZlKCk7XG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1oYXMtZmVlZGJhY2snKS5yZW1vdmVDbGFzcygnaDVwLWhhcy1mZWVkYmFjaycpO1xuICAgICAgaWYgKCRmZWVkYmFja0RpYWxvZykge1xuICAgICAgICAkZmVlZGJhY2tEaWFsb2cucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzY29yZSA9IDA7XG4gICAgdmFyIHNvbHV0aW9uc1Zpc2libGUgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEFkZCBmZWVkYmFjayB0byBlbGVtZW50XG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IEVsZW1lbnQgdGhhdCBmZWVkYmFjayB3aWxsIGJlIGFkZGVkIHRvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZlZWRiYWNrIEZlZWRiYWNrIHN0cmluZ1xuICAgICAqL1xuICAgIHZhciBhZGRGZWVkYmFjayA9IGZ1bmN0aW9uICgkZWxlbWVudCwgZmVlZGJhY2spIHtcbiAgICAgICRmZWVkYmFja0RpYWxvZyA9ICQoJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImg1cC1mZWVkYmFjay1kaWFsb2dcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJoNXAtZmVlZGJhY2staW5uZXJcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJoNXAtZmVlZGJhY2stdGV4dFwiPicgKyBmZWVkYmFjayArICc8L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+Jyk7XG5cbiAgICAgIC8vbWFrZSBzdXJlIGZlZWRiYWNrIGlzIG9ubHkgYWRkZWQgb25jZVxuICAgICAgaWYgKCEkZWxlbWVudC5maW5kKCQoJy5oNXAtZmVlZGJhY2stZGlhbG9nJykpLmxlbmd0aCkge1xuICAgICAgICAkZmVlZGJhY2tEaWFsb2cuYXBwZW5kVG8oJGVsZW1lbnQuYWRkQ2xhc3MoJ2g1cC1oYXMtZmVlZGJhY2snKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRoZSBkaWZmZXJlbnQgcGFydHMgb2YgdGhlIHRhc2sgd2l0aCB0aGUgUXVlc3Rpb24gc3RydWN0dXJlLlxuICAgICAqL1xuICAgIHNlbGYucmVnaXN0ZXJEb21FbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtZWRpYSA9IHBhcmFtcy5tZWRpYTtcbiAgICAgIGlmIChtZWRpYSAmJiBtZWRpYS50eXBlICYmIG1lZGlhLnR5cGUubGlicmFyeSkge1xuICAgICAgICBtZWRpYSA9IG1lZGlhLnR5cGU7XG4gICAgICAgIHZhciB0eXBlID0gbWVkaWEubGlicmFyeS5zcGxpdCgnICcpWzBdO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ0g1UC5JbWFnZScpIHtcbiAgICAgICAgICBpZiAobWVkaWEucGFyYW1zLmZpbGUpIHtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRhc2sgaW1hZ2VcbiAgICAgICAgICAgIHNlbGYuc2V0SW1hZ2UobWVkaWEucGFyYW1zLmZpbGUucGF0aCwge1xuICAgICAgICAgICAgICBkaXNhYmxlSW1hZ2Vab29taW5nOiBwYXJhbXMubWVkaWEuZGlzYWJsZUltYWdlWm9vbWluZyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgYWx0OiBtZWRpYS5wYXJhbXMuYWx0LFxuICAgICAgICAgICAgICB0aXRsZTogbWVkaWEucGFyYW1zLnRpdGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ0g1UC5WaWRlbycpIHtcbiAgICAgICAgICBpZiAobWVkaWEucGFyYW1zLnNvdXJjZXMpIHtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRhc2sgdmlkZW9cbiAgICAgICAgICAgIHNlbGYuc2V0VmlkZW8obWVkaWEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnSDVQLkF1ZGlvJykge1xuICAgICAgICAgIGlmIChtZWRpYS5wYXJhbXMuZmlsZXMpIHtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRhc2sgYXVkaW9cbiAgICAgICAgICAgIHNlbGYuc2V0QXVkaW8obWVkaWEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgd2UncmUgdXNpbmcgY2hlY2tib3hlcyBvciByYWRpbyBidXR0b25zXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcmFtcy5hbnN3ZXJzW2ldLmNoZWNrYm94T3JSYWRpb0ljb24gPSBnZXRDaGVja2JveE9yUmFkaW9JY29uKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyLCBwYXJhbXMudXNlckFuc3dlcnMuaW5kZXhPZihpKSA+IC0xKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVnaXN0ZXIgSW50cm9kdWN0aW9uXG4gICAgICBzZWxmLnNldEludHJvZHVjdGlvbignPGRpdiBpZD1cIicgKyBwYXJhbXMubGFiZWxJZCArICdcIj4nICsgcGFyYW1zLnF1ZXN0aW9uICsgJzwvZGl2PicpO1xuXG4gICAgICAvLyBSZWdpc3RlciB0YXNrIGNvbnRlbnQgYXJlYVxuICAgICAgJG15RG9tID0gJCgnPHVsPicsIHtcbiAgICAgICAgJ2NsYXNzJzogJ2g1cC1hbnN3ZXJzJyxcbiAgICAgICAgcm9sZTogcGFyYW1zLnJvbGUsXG4gICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBwYXJhbXMubGFiZWxJZFxuICAgICAgfSk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYW5zd2VyID0gcGFyYW1zLmFuc3dlcnNbaV07XG4gICAgICAgICQoJzxsaT4nLCB7XG4gICAgICAgICAgJ2NsYXNzJzogJ2g1cC1hbnN3ZXInLFxuICAgICAgICAgIHJvbGU6IGFuc3dlci5yb2xlLFxuICAgICAgICAgIHRhYmluZGV4OiBhbnN3ZXIudGFiaW5kZXgsXG4gICAgICAgICAgJ2FyaWEtY2hlY2tlZCc6IGFuc3dlci5jaGVja2VkLFxuICAgICAgICAgICdkYXRhLWlkJzogaSxcbiAgICAgICAgICBodG1sOiAnPGRpdiBjbGFzcz1cImg1cC1hbHRlcm5hdGl2ZS1jb250YWluZXJcIiBhbnN3ZXItaWQ9XCInICsgaS50b1N0cmluZygpICsgJ1wiPjxzcGFuIGNsYXNzPVwiaDVwLWFsdGVybmF0aXZlLWlubmVyXCI+JyArIGFuc3dlci50ZXh0ICsgJzwvc3Bhbj48L2Rpdj4nLFxuICAgICAgICAgIGFwcGVuZFRvOiAkbXlEb21cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuc2V0Q29udGVudCgkbXlEb20sIHtcbiAgICAgICAgJ2NsYXNzJzogcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPyAnaDVwLXJhZGlvJyA6ICdoNXAtY2hlY2snXG4gICAgICB9KTtcblxuICAgICAgLy8gQ3JlYXRlIHRpcHM6XG4gICAgICB2YXIgJGFuc3dlcnMgPSAkKCcuaDVwLWFuc3dlcicsICRteURvbSkuZWFjaChmdW5jdGlvbiAoaSkge1xuXG4gICAgICAgIHZhciB0aXAgPSBwYXJhbXMuYW5zd2Vyc1tpXS50aXBzQW5kRmVlZGJhY2sudGlwO1xuICAgICAgICBpZiAodGlwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm47IC8vIE5vIHRpcFxuICAgICAgICB9XG5cbiAgICAgICAgdGlwID0gdGlwLnRyaW0oKTtcbiAgICAgICAgdmFyIHRpcENvbnRlbnQgPSB0aXBcbiAgICAgICAgICAucmVwbGFjZSgvJm5ic3A7L2csICcnKVxuICAgICAgICAgIC5yZXBsYWNlKC88cD4vZywgJycpXG4gICAgICAgICAgLnJlcGxhY2UoLzxcXC9wPi9nLCAnJylcbiAgICAgICAgICAudHJpbSgpO1xuICAgICAgICBpZiAoIXRpcENvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBFbXB0eSB0aXBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdoNXAtaGFzLXRpcCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRpcFxuICAgICAgICB2YXIgJHdyYXAgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgJ2NsYXNzJzogJ2g1cC1tdWx0aWNob2ljZS10aXB3cmFwJyxcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IHBhcmFtcy5VSS50aXBBdmFpbGFibGUgKyAnLidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyICRtdWx0aWNob2ljZVRpcCA9ICQoJzxkaXY+Jywge1xuICAgICAgICAgICdyb2xlJzogJ2J1dHRvbicsXG4gICAgICAgICAgJ3RhYmluZGV4JzogMCxcbiAgICAgICAgICAndGl0bGUnOiBwYXJhbXMuVUkudGlwc0xhYmVsLFxuICAgICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLnRpcHNMYWJlbCxcbiAgICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAgICAgICdjbGFzcyc6ICdtdWx0aWNob2ljZS10aXAnLFxuICAgICAgICAgIGFwcGVuZFRvOiAkd3JhcFxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdGlwSWNvbkh0bWwgPSAnPHNwYW4gY2xhc3M9XCJqb3ViZWwtaWNvbi10aXAtbm9ybWFsXCI+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaDVwLWljb24tc2hhZG93XCI+PC9zcGFuPicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImg1cC1pY29uLXNwZWVjaC1idWJibGVcIj48L3NwYW4+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaDVwLWljb24taW5mb1wiPjwvc3Bhbj4nICtcbiAgICAgICAgICAnPC9zcGFuPic7XG5cbiAgICAgICAgJG11bHRpY2hvaWNlVGlwLmFwcGVuZCh0aXBJY29uSHRtbCk7XG5cbiAgICAgICAgJG11bHRpY2hvaWNlVGlwLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgJHRpcENvbnRhaW5lciA9ICRtdWx0aWNob2ljZVRpcC5wYXJlbnRzKCcuaDVwLWFuc3dlcicpO1xuICAgICAgICAgIHZhciBvcGVuRmVlZGJhY2sgPSAhJHRpcENvbnRhaW5lci5jaGlsZHJlbignLmg1cC1mZWVkYmFjay1kaWFsb2cnKS5pcygkZmVlZGJhY2tEaWFsb2cpO1xuICAgICAgICAgIHJlbW92ZUZlZWRiYWNrRGlhbG9nKCk7XG5cbiAgICAgICAgICAvLyBEbyBub3Qgb3BlbiBmZWVkYmFjayBpZiBpdCB3YXMgb3BlblxuICAgICAgICAgIGlmIChvcGVuRmVlZGJhY2spIHtcbiAgICAgICAgICAgICRtdWx0aWNob2ljZVRpcC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aXAgZGlhbG9nXG4gICAgICAgICAgICBhZGRGZWVkYmFjaygkdGlwQ29udGFpbmVyLCB0aXApO1xuICAgICAgICAgICAgJGZlZWRiYWNrRGlhbG9nLmFkZENsYXNzKCdoNXAtaGFzLXRpcCcpO1xuXG4gICAgICAgICAgICAvLyBUaXAgZm9yIHJlYWRzcGVha2VyXG4gICAgICAgICAgICBzZWxmLnJlYWQodGlwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkbXVsdGljaG9pY2VUaXAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIHRpcCBkaWFsb2cgb24gZG9tIGNsaWNrXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbXlEb20uY2xpY2socmVtb3ZlRmVlZGJhY2tEaWFsb2cpO1xuICAgICAgICAgIH0sIDEwMCk7XG5cbiAgICAgICAgICAvLyBEbyBub3QgcHJvcGFnYXRlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KS5rZXlkb3duKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKGUud2hpY2ggPT09IDMyKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmNsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuaDVwLWFsdGVybmF0aXZlLWNvbnRhaW5lcicsIHRoaXMpLmFwcGVuZCgkd3JhcCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gU2V0IGV2ZW50IGxpc3RlbmVycy5cbiAgICAgIHZhciB0b2dnbGVDaGVjayA9IGZ1bmN0aW9uICgkYW5zKSB7XG4gICAgICAgIGlmICgkYW5zLmF0dHIoJ2FyaWEtZGlzYWJsZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuYW5zd2VyZWQgPSB0cnVlO1xuICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQoJGFucy5kYXRhKCdpZCcpKTtcbiAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgICAgLy8gU3RvcmUgYW5zd2VyXG4gICAgICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzID0gW251bV07XG5cbiAgICAgICAgICAvLyBDYWxjdWxhdGUgc2NvcmVcbiAgICAgICAgICBzY29yZSA9IChwYXJhbXMuYW5zd2Vyc1tudW1dLmNvcnJlY3QgPyAxIDogMCk7XG5cbiAgICAgICAgICAvLyBEZS1zZWxlY3QgcHJldmlvdXMgYW5zd2VyXG4gICAgICAgICAgJGFuc3dlcnMubm90KCRhbnMpLnJlbW92ZUNsYXNzKCdoNXAtc2VsZWN0ZWQnKS5hdHRyKCd0YWJpbmRleCcsICctMScpLmF0dHIoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuXG4gICAgICAgICAgLy8gU2VsZWN0IG5ldyBhbnN3ZXJcbiAgICAgICAgICAkYW5zLmFkZENsYXNzKCdoNXAtc2VsZWN0ZWQnKS5hdHRyKCd0YWJpbmRleCcsICcwJykuYXR0cignYXJpYS1jaGVja2VkJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoJGFucy5hdHRyKCdhcmlhLWNoZWNrZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBwYXJhbXMudXNlckFuc3dlcnMuaW5kZXhPZihudW0pO1xuICAgICAgICAgICAgaWYgKHBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzLnNwbGljZShwb3MsIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEbyBub3QgYWxsb3cgdW4tY2hlY2tpbmcgd2hlbiByZXRyeSBkaXNhYmxlZCBhbmQgYXV0byBjaGVja1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrICYmICFwYXJhbXMuYmVoYXZpb3VyLmVuYWJsZVJldHJ5KSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGNoZWNrXG4gICAgICAgICAgICAkYW5zLnJlbW92ZUNsYXNzKCdoNXAtc2VsZWN0ZWQnKS5hdHRyKCdhcmlhLWNoZWNrZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMudXNlckFuc3dlcnMucHVzaChudW0pO1xuICAgICAgICAgICAgJGFucy5hZGRDbGFzcygnaDVwLXNlbGVjdGVkJykuYXR0cignYXJpYS1jaGVja2VkJywgJ3RydWUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDYWxjdWxhdGUgc2NvcmVcbiAgICAgICAgICBjYWxjU2NvcmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYudHJpZ2dlclhBUEkoJ2ludGVyYWN0ZWQnKTtcbiAgICAgICAgaGlkZVNvbHV0aW9uKCRhbnMpO1xuXG4gICAgICAgIGlmIChwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgc2VsZi5zaG93QnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcbiAgICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgICAgIHNlbGYuaGlkZUJ1dHRvbignc2hvdy1zb2x1dGlvbicpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgICAgICAgLy8gT25seSBhIHNpbmdsZSBhbnN3ZXIgYWxsb3dlZFxuICAgICAgICAgICAgICBjaGVja0Fuc3dlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFNob3cgZmVlZGJhY2sgZm9yIHNlbGVjdGVkIGFsdGVybmF0aXZlc1xuICAgICAgICAgICAgICBzZWxmLnNob3dDaGVja1NvbHV0aW9uKHRydWUpO1xuXG4gICAgICAgICAgICAgIC8vIEFsd2F5cyBmaW5pc2ggdGFzayBpZiBpdCB3YXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICBpZiAoc2NvcmUgPT09IHNlbGYuZ2V0TWF4U2NvcmUoKSkge1xuICAgICAgICAgICAgICAgIGNoZWNrQW5zd2VyKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRhbnN3ZXJzLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdG9nZ2xlQ2hlY2soJCh0aGlzKSk7XG4gICAgICB9KS5rZXlkb3duKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7IC8vIFNwYWNlIGJhclxuICAgICAgICAgIC8vIFNlbGVjdCBjdXJyZW50IGl0ZW1cbiAgICAgICAgICB0b2dnbGVDaGVjaygkKHRoaXMpKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzODogICAvLyBVcFxuICAgICAgICAgICAgY2FzZSAzNzogeyAvLyBMZWZ0XG4gICAgICAgICAgICAgIC8vIFRyeSB0byBzZWxlY3QgcHJldmlvdXMgaXRlbVxuICAgICAgICAgICAgICB2YXIgJHByZXYgPSAkKHRoaXMpLnByZXYoKTtcbiAgICAgICAgICAgICAgaWYgKCRwcmV2Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRvZ2dsZUNoZWNrKCRwcmV2LmZvY3VzKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgNDA6ICAgLy8gRG93blxuICAgICAgICAgICAgY2FzZSAzOTogeyAvLyBSaWdodFxuICAgICAgICAgICAgICAvLyBUcnkgdG8gc2VsZWN0IG5leHQgaXRlbVxuICAgICAgICAgICAgICB2YXIgJG5leHQgPSAkKHRoaXMpLm5leHQoKTtcbiAgICAgICAgICAgICAgaWYgKCRuZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRvZ2dsZUNoZWNrKCRuZXh0LmZvY3VzKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgLy8gU3BlY2lhbCBmb2N1cyBoYW5kbGVyIGZvciByYWRpbyBidXR0b25zXG4gICAgICAgICRhbnN3ZXJzLmZvY3VzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoJCh0aGlzKS5hdHRyKCdhcmlhLWRpc2FibGVkJykgIT09ICd0cnVlJykge1xuICAgICAgICAgICAgJGFuc3dlcnMubm90KHRoaXMpLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5ibHVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoISRhbnN3ZXJzLmZpbHRlcignLmg1cC1zZWxlY3RlZCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgJGFuc3dlcnMuZmlyc3QoKS5hZGQoJGFuc3dlcnMubGFzdCgpKS5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkcyBjaGVjayBhbmQgcmV0cnkgYnV0dG9uXG4gICAgICBhZGRCdXR0b25zKCk7XG4gICAgICBpZiAoIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG5cbiAgICAgICAgY2FsY1Njb3JlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGggJiYgcGFyYW1zLmFuc3dlcnNbcGFyYW1zLnVzZXJBbnN3ZXJzWzBdXS5jb3JyZWN0KSB7XG4gICAgICAgICAgc2NvcmUgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNjb3JlID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBIYXMgYW5zd2VyZWQgdGhyb3VnaCBhdXRvLWNoZWNrIGluIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgICAgaWYgKGhhc0NoZWNrZWRBbnN3ZXIgJiYgcGFyYW1zLmJlaGF2aW91ci5hdXRvQ2hlY2spIHtcblxuICAgICAgICAvLyBDaGVjayBhbnN3ZXJzIGlmIGFuc3dlciBoYXMgYmVlbiBnaXZlbiBvciBtYXggc2NvcmUgcmVhY2hlZFxuICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgfHwgc2NvcmUgPT09IHNlbGYuZ2V0TWF4U2NvcmUoKSkge1xuICAgICAgICAgIGNoZWNrQW5zd2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gU2hvdyBmZWVkYmFjayBmb3IgY2hlY2tlZCBjaGVja2JveGVzXG4gICAgICAgICAgc2VsZi5zaG93Q2hlY2tTb2x1dGlvbih0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnNob3dBbGxTb2x1dGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc29sdXRpb25zVmlzaWJsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzb2x1dGlvbnNWaXNpYmxlID0gdHJ1ZTtcblxuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtYW5zd2VyJykuZWFjaChmdW5jdGlvbiAoaSwgZSkge1xuICAgICAgICB2YXIgJGUgPSAkKGUpO1xuICAgICAgICB2YXIgYSA9IHBhcmFtcy5hbnN3ZXJzW2ldO1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSAnaDVwLXNvbHV0aW9uLWljb24tJyArIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciA/ICdyYWRpbycgOiAnY2hlY2tib3gnKTtcblxuICAgICAgICBpZiAoYS5jb3JyZWN0KSB7XG4gICAgICAgICAgJGUuYWRkQ2xhc3MoJ2g1cC1zaG91bGQnKS5hcHBlbmQoJCgnPHNwYW4vPicsIHtcbiAgICAgICAgICAgICdjbGFzcyc6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIGh0bWw6IHBhcmFtcy5VSS5zaG91bGRDaGVjayArICcuJ1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAkZS5hZGRDbGFzcygnaDVwLXNob3VsZC1ub3QnKS5hcHBlbmQoJCgnPHNwYW4vPicsIHtcbiAgICAgICAgICAgICdjbGFzcyc6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIGh0bWw6IHBhcmFtcy5VSS5zaG91bGROb3RDaGVjayArICcuJ1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSkuZmluZCgnLmg1cC1xdWVzdGlvbi1wbHVzLW9uZSwgLmg1cC1xdWVzdGlvbi1taW51cy1vbmUnKS5yZW1vdmUoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIGlucHV0IGlzIGRpc2FibGVkIGluIHNvbHV0aW9uIG1vZGVcbiAgICAgIGRpc2FibGVJbnB1dCgpO1xuXG4gICAgICAvLyBNb3ZlIGZvY3VzIGJhY2sgdG8gdGhlIGZpcnN0IGFsdGVybmF0aXZlIHNvIHRoYXQgdGhlIHVzZXIgYmVjb21lc1xuICAgICAgLy8gYXdhcmUgdGhhdCB0aGUgc29sdXRpb24gaXMgYmVpbmcgc2hvd24uXG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXI6Zmlyc3QtY2hpbGQnKS5mb2N1cygpO1xuXG4gICAgICAvL0hpZGUgYnV0dG9ucyBhbmQgcmV0cnkgZGVwZW5kaW5nIG9uIHNldHRpbmdzLlxuICAgICAgc2VsZi5oaWRlQnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcbiAgICAgIHNlbGYuaGlkZUJ1dHRvbignc2hvdy1zb2x1dGlvbicpO1xuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuZW5hYmxlUmV0cnkpIHtcbiAgICAgICAgc2VsZi5zaG93QnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICAgIH1cbiAgICAgIHNlbGYudHJpZ2dlcigncmVzaXplJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgaW4gY29udHJhY3RzLlxuICAgICAqIFNob3dzIHRoZSBzb2x1dGlvbiBmb3IgdGhlIHRhc2sgYW5kIGhpZGVzIGFsbCBidXR0b25zLlxuICAgICAqL1xuICAgIHRoaXMuc2hvd1NvbHV0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlbW92ZUZlZWRiYWNrRGlhbG9nKCk7XG4gICAgICBzZWxmLnNob3dDaGVja1NvbHV0aW9uKCk7XG4gICAgICBzZWxmLnNob3dBbGxTb2x1dGlvbnMoKTtcbiAgICAgIGRpc2FibGVJbnB1dCgpO1xuICAgICAgc2VsZi5oaWRlQnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGlkZSBzb2x1dGlvbiBmb3IgdGhlIGdpdmVuIGFuc3dlcihzKVxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGFuc3dlclxuICAgICAqL1xuICAgIHZhciBoaWRlU29sdXRpb24gPSBmdW5jdGlvbiAoJGFuc3dlcikge1xuICAgICAgJGFuc3dlclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1jb3JyZWN0JylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtd3JvbmcnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1zaG91bGQnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1zaG91bGQtbm90JylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtaGFzLWZlZWRiYWNrJylcbiAgICAgICAgLmZpbmQoJy5oNXAtcXVlc3Rpb24tcGx1cy1vbmUsICcgK1xuICAgICAgICAgICcuaDVwLXF1ZXN0aW9uLW1pbnVzLW9uZSwgJyArXG4gICAgICAgICAgJy5oNXAtYW5zd2VyLWljb24sICcgK1xuICAgICAgICAgICcuaDVwLXNvbHV0aW9uLWljb24tcmFkaW8sICcgK1xuICAgICAgICAgICcuaDVwLXNvbHV0aW9uLWljb24tY2hlY2tib3gsICcgK1xuICAgICAgICAgICcuaDVwLWZlZWRiYWNrLWRpYWxvZycpXG4gICAgICAgIC5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKi9cbiAgICB0aGlzLmhpZGVTb2x1dGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzb2x1dGlvbnNWaXNpYmxlID0gZmFsc2U7XG5cbiAgICAgIGhpZGVTb2x1dGlvbigkKCcuaDVwLWFuc3dlcicsICRteURvbSkpO1xuXG4gICAgICB0aGlzLnJlbW92ZUZlZWRiYWNrKCk7IC8vIFJlc2V0IGZlZWRiYWNrXG5cbiAgICAgIHNlbGYudHJpZ2dlcigncmVzaXplJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgd2hvbGUgdGFzay5cbiAgICAgKiBVc2VkIGluIGNvbnRyYWN0cyB3aXRoIGludGVncmF0ZWQgY29udGVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucmVzZXRUYXNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5hbnN3ZXJlZCA9IGZhbHNlO1xuICAgICAgc2VsZi5oaWRlU29sdXRpb25zKCk7XG4gICAgICBwYXJhbXMudXNlckFuc3dlcnMgPSBbXTtcbiAgICAgIHJlbW92ZVNlbGVjdGlvbnMoKTtcbiAgICAgIHNlbGYuc2hvd0J1dHRvbignY2hlY2stYW5zd2VyJyk7XG4gICAgICBzZWxmLmhpZGVCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgc2VsZi5oaWRlQnV0dG9uKCdzaG93LXNvbHV0aW9uJyk7XG4gICAgICBlbmFibGVJbnB1dCgpO1xuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtZmVlZGJhY2stYXZhaWxhYmxlJykucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIHZhciBjYWxjdWxhdGVNYXhTY29yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChibGFua0lzQ29ycmVjdCkge1xuICAgICAgICByZXR1cm4gcGFyYW1zLndlaWdodDtcbiAgICAgIH1cbiAgICAgIHZhciBtYXhTY29yZSA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaG9pY2UgPSBwYXJhbXMuYW5zd2Vyc1tpXTtcbiAgICAgICAgaWYgKGNob2ljZS5jb3JyZWN0KSB7XG4gICAgICAgICAgbWF4U2NvcmUgKz0gKGNob2ljZS53ZWlnaHQgIT09IHVuZGVmaW5lZCA/IGNob2ljZS53ZWlnaHQgOiAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1heFNjb3JlO1xuICAgIH07XG5cbiAgICB0aGlzLmdldE1heFNjb3JlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICghcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgJiYgIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlUG9pbnQgPyBjYWxjdWxhdGVNYXhTY29yZSgpIDogcGFyYW1zLndlaWdodCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGFuc3dlclxuICAgICAqL1xuICAgIHZhciBjaGVja0Fuc3dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFVuYmluZCByZW1vdmFsIG9mIGZlZWRiYWNrIGRpYWxvZ3Mgb24gY2xpY2tcbiAgICAgICRteURvbS51bmJpbmQoJ2NsaWNrJywgcmVtb3ZlRmVlZGJhY2tEaWFsb2cpO1xuXG4gICAgICAvLyBSZW1vdmUgYWxsIHRpcCBkaWFsb2dzXG4gICAgICByZW1vdmVGZWVkYmFja0RpYWxvZygpO1xuXG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5lbmFibGVTb2x1dGlvbnNCdXR0b24pIHtcbiAgICAgICAgc2VsZi5zaG93QnV0dG9uKCdzaG93LXNvbHV0aW9uJyk7XG4gICAgICB9XG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5lbmFibGVSZXRyeSkge1xuICAgICAgICBzZWxmLnNob3dCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgfVxuICAgICAgc2VsZi5oaWRlQnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcblxuICAgICAgc2VsZi5zaG93Q2hlY2tTb2x1dGlvbigpO1xuICAgICAgZGlzYWJsZUlucHV0KCk7XG5cbiAgICAgIHZhciB4QVBJRXZlbnQgPSBzZWxmLmNyZWF0ZVhBUElFdmVudFRlbXBsYXRlKCdhbnN3ZXJlZCcpO1xuICAgICAgYWRkUXVlc3Rpb25Ub1hBUEkoeEFQSUV2ZW50KTtcbiAgICAgIGFkZFJlc3BvbnNlVG9YQVBJKHhBUElFdmVudCk7XG4gICAgICBzZWxmLnRyaWdnZXIoeEFQSUV2ZW50KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgdWkgYnV0dG9ucy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHZhciBhZGRCdXR0b25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRjb250ZW50ID0gJCgnW2RhdGEtY29udGVudC1pZD1cIicgKyBzZWxmLmNvbnRlbnRJZCArICdcIl0uaDVwLWNvbnRlbnQnKTtcbiAgICAgIHZhciAkY29udGFpbmVyUGFyZW50cyA9ICRjb250ZW50LnBhcmVudHMoJy5oNXAtY29udGFpbmVyJyk7XG5cbiAgICAgIC8vIHNlbGVjdCBmaW5kIGNvbnRhaW5lciB0byBhdHRhY2ggZGlhbG9ncyB0b1xuICAgICAgdmFyICRjb250YWluZXI7XG4gICAgICBpZiAoJGNvbnRhaW5lclBhcmVudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHVzZSBwYXJlbnQgaGlnaGVzdCB1cCBpZiBhbnlcbiAgICAgICAgJGNvbnRhaW5lciA9ICRjb250YWluZXJQYXJlbnRzLmxhc3QoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCRjb250ZW50Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAkY29udGFpbmVyID0gJGNvbnRlbnQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJGNvbnRhaW5lciA9ICQoZG9jdW1lbnQuYm9keSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3cgc29sdXRpb24gYnV0dG9uXG4gICAgICBzZWxmLmFkZEJ1dHRvbignc2hvdy1zb2x1dGlvbicsIHBhcmFtcy5VSS5zaG93U29sdXRpb25CdXR0b24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2hvd1NvbHV0aW9uc1JlcXVpcmVzSW5wdXQgJiYgIXNlbGYuZ2V0QW5zd2VyR2l2ZW4odHJ1ZSkpIHtcbiAgICAgICAgICAvLyBSZXF1aXJlIGFuc3dlciBiZWZvcmUgc29sdXRpb24gY2FuIGJlIHZpZXdlZFxuICAgICAgICAgIHNlbGYudXBkYXRlRmVlZGJhY2tDb250ZW50KHBhcmFtcy5VSS5ub0lucHV0KTtcbiAgICAgICAgICBzZWxmLnJlYWQocGFyYW1zLlVJLm5vSW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNhbGNTY29yZSgpO1xuICAgICAgICAgIHNlbGYuc2hvd0FsbFNvbHV0aW9ucygpO1xuICAgICAgICB9XG5cbiAgICAgIH0sIGZhbHNlLCB7XG4gICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLmExMXlTaG93U29sdXRpb24sXG4gICAgICB9KTtcblxuICAgICAgLy8gQ2hlY2sgYnV0dG9uXG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5lbmFibGVDaGVja0J1dHRvbiAmJiAoIXBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrIHx8ICFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikpIHtcbiAgICAgICAgc2VsZi5hZGRCdXR0b24oJ2NoZWNrLWFuc3dlcicsIHBhcmFtcy5VSS5jaGVja0Fuc3dlckJ1dHRvbixcbiAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmFuc3dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNoZWNrQW5zd2VyKCk7XG4gICAgICAgICAgICAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXI6Zmlyc3QtY2hpbGQnKS5mb2N1cygpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6IHBhcmFtcy5VSS5hMTF5Q2hlY2ssXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb25maXJtYXRpb25EaWFsb2c6IHtcbiAgICAgICAgICAgICAgZW5hYmxlOiBwYXJhbXMuYmVoYXZpb3VyLmNvbmZpcm1DaGVja0RpYWxvZyxcbiAgICAgICAgICAgICAgbDEwbjogcGFyYW1zLmNvbmZpcm1DaGVjayxcbiAgICAgICAgICAgICAgaW5zdGFuY2U6IHNlbGYsXG4gICAgICAgICAgICAgICRwYXJlbnRFbGVtZW50OiAkY29udGFpbmVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGVudERhdGE6IHNlbGYuY29udGVudERhdGEsXG4gICAgICAgICAgICB0ZXh0SWZTdWJtaXR0aW5nOiBwYXJhbXMuVUkuc3VibWl0QW5zd2VyQnV0dG9uLFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gVHJ5IEFnYWluIGJ1dHRvblxuICAgICAgc2VsZi5hZGRCdXR0b24oJ3RyeS1hZ2FpbicsIHBhcmFtcy5VSS50cnlBZ2FpbkJ1dHRvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnJlc2V0VGFzaygpO1xuXG4gICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnJhbmRvbUFuc3dlcnMpIHtcbiAgICAgICAgICAvLyByZXNodWZmbGUgYW5zd2Vyc1xuICAgICAgICAgIHZhciBvbGRJZE1hcCA9IGlkTWFwO1xuICAgICAgICAgIGlkTWFwID0gZ2V0U2h1ZmZsZU1hcCgpO1xuICAgICAgICAgIHZhciBhbnN3ZXJzRGlzcGxheWVkID0gJG15RG9tLmZpbmQoJy5oNXAtYW5zd2VyJyk7XG4gICAgICAgICAgLy8gcmVtZW1iZXIgdGlwc1xuICAgICAgICAgIHZhciB0aXAgPSBbXTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYW5zd2Vyc0Rpc3BsYXllZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGlwW2ldID0gJChhbnN3ZXJzRGlzcGxheWVkW2ldKS5maW5kKCcuaDVwLW11bHRpY2hvaWNlLXRpcHdyYXAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhvc2UgdHdvIGxvb3BzIGNhbm5vdCBiZSBtZXJnZWQgb3IgeW91J2xsIHNjcmV3IHVwIHlvdXIgdGlwc1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhbnN3ZXJzRGlzcGxheWVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBtb3ZlIHRpcHMgYW5kIGFuc3dlcnMgb24gZGlzcGxheVxuICAgICAgICAgICAgJChhbnN3ZXJzRGlzcGxheWVkW2ldKS5maW5kKCcuaDVwLWFsdGVybmF0aXZlLWlubmVyJykuaHRtbChwYXJhbXMuYW5zd2Vyc1tpXS50ZXh0KTtcbiAgICAgICAgICAgICQodGlwW2ldKS5kZXRhY2goKS5hcHBlbmRUbygkKGFuc3dlcnNEaXNwbGF5ZWRbaWRNYXAuaW5kZXhPZihvbGRJZE1hcFtpXSldKS5maW5kKCcuaDVwLWFsdGVybmF0aXZlLWNvbnRhaW5lcicpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGZhbHNlLCB7XG4gICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLmExMXlSZXRyeSxcbiAgICAgIH0sIHtcbiAgICAgICAgY29uZmlybWF0aW9uRGlhbG9nOiB7XG4gICAgICAgICAgZW5hYmxlOiBwYXJhbXMuYmVoYXZpb3VyLmNvbmZpcm1SZXRyeURpYWxvZyxcbiAgICAgICAgICBsMTBuOiBwYXJhbXMuY29uZmlybVJldHJ5LFxuICAgICAgICAgIGluc3RhbmNlOiBzZWxmLFxuICAgICAgICAgICRwYXJlbnRFbGVtZW50OiAkY29udGFpbmVyXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmUgd2hpY2ggZmVlZGJhY2sgdGV4dCB0byBkaXNwbGF5XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcmVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4XG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIHZhciBnZXRGZWVkYmFja1RleHQgPSBmdW5jdGlvbiAoc2NvcmUsIG1heCkge1xuICAgICAgdmFyIHJhdGlvID0gKHNjb3JlIC8gbWF4KTtcblxuICAgICAgdmFyIGZlZWRiYWNrID0gUXVlc3Rpb24uZGV0ZXJtaW5lT3ZlcmFsbEZlZWRiYWNrKHBhcmFtcy5vdmVyYWxsRmVlZGJhY2ssIHJhdGlvKTtcblxuICAgICAgcmV0dXJuIGZlZWRiYWNrLnJlcGxhY2UoJ0BzY29yZScsIHNjb3JlKS5yZXBsYWNlKCdAdG90YWwnLCBtYXgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTaG93cyBmZWVkYmFjayBvbiB0aGUgc2VsZWN0ZWQgZmllbGRzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtza2lwRmVlZGJhY2tdIFNraXAgc2hvd2luZyBmZWVkYmFjayBpZiB0cnVlXG4gICAgICovXG4gICAgdGhpcy5zaG93Q2hlY2tTb2x1dGlvbiA9IGZ1bmN0aW9uIChza2lwRmVlZGJhY2spIHtcbiAgICAgIHZhciBzY29yZVBvaW50cztcbiAgICAgIGlmICghKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyIHx8IHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlUG9pbnQgfHwgIXBhcmFtcy5iZWhhdmlvdXIuc2hvd1Njb3JlUG9pbnRzKSkge1xuICAgICAgICBzY29yZVBvaW50cyA9IG5ldyBRdWVzdGlvbi5TY29yZVBvaW50cygpO1xuICAgICAgfVxuXG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXInKS5lYWNoKGZ1bmN0aW9uIChpLCBlKSB7XG4gICAgICAgIHZhciAkZSA9ICQoZSk7XG4gICAgICAgIHZhciBhID0gcGFyYW1zLmFuc3dlcnNbaV07XG4gICAgICAgIHZhciBjaG9zZW4gPSAoJGUuYXR0cignYXJpYS1jaGVja2VkJykgPT09ICd0cnVlJyk7XG4gICAgICAgIGlmIChjaG9zZW4pIHtcbiAgICAgICAgICBpZiAoYS5jb3JyZWN0KSB7XG4gICAgICAgICAgICAvLyBNYXkgYWxyZWFkeSBoYXZlIGJlZW4gYXBwbGllZCBieSBpbnN0YW50IGZlZWRiYWNrXG4gICAgICAgICAgICBpZiAoISRlLmhhc0NsYXNzKCdoNXAtY29ycmVjdCcpKSB7XG4gICAgICAgICAgICAgICRlLmFkZENsYXNzKCdoNXAtY29ycmVjdCcpLmFwcGVuZCgkKCc8c3Bhbi8+Jywge1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdoNXAtYW5zd2VyLWljb24nLFxuICAgICAgICAgICAgICAgIGh0bWw6IHBhcmFtcy5VSS5jb3JyZWN0QW5zd2VyICsgJy4nXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoISRlLmhhc0NsYXNzKCdoNXAtd3JvbmcnKSkge1xuICAgICAgICAgICAgICAkZS5hZGRDbGFzcygnaDVwLXdyb25nJykuYXBwZW5kKCQoJzxzcGFuLz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2g1cC1hbnN3ZXItaWNvbicsXG4gICAgICAgICAgICAgICAgaHRtbDogcGFyYW1zLlVJLndyb25nQW5zd2VyICsgJy4nXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2NvcmVQb2ludHMpIHtcbiAgICAgICAgICAgIHZhciBhbHRlcm5hdGl2ZUNvbnRhaW5lciA9ICRlWzBdLnF1ZXJ5U2VsZWN0b3IoJy5oNXAtYWx0ZXJuYXRpdmUtY29udGFpbmVyJyk7XG5cbiAgICAgICAgICAgIGlmICghcGFyYW1zLmJlaGF2aW91ci5hdXRvQ2hlY2sgfHwgYWx0ZXJuYXRpdmVDb250YWluZXIucXVlcnlTZWxlY3RvcignLmg1cC1xdWVzdGlvbi1wbHVzLW9uZSwgLmg1cC1xdWVzdGlvbi1taW51cy1vbmUnKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChzY29yZVBvaW50cy5nZXRFbGVtZW50KGEuY29ycmVjdCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2tpcEZlZWRiYWNrKSB7XG4gICAgICAgICAgaWYgKGNob3NlbiAmJiBhLnRpcHNBbmRGZWVkYmFjay5jaG9zZW5GZWVkYmFjayAhPT0gdW5kZWZpbmVkICYmIGEudGlwc0FuZEZlZWRiYWNrLmNob3NlbkZlZWRiYWNrICE9PSAnJykge1xuICAgICAgICAgICAgYWRkRmVlZGJhY2soJGUsIGEudGlwc0FuZEZlZWRiYWNrLmNob3NlbkZlZWRiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIWNob3NlbiAmJiBhLnRpcHNBbmRGZWVkYmFjay5ub3RDaG9zZW5GZWVkYmFjayAhPT0gdW5kZWZpbmVkICYmIGEudGlwc0FuZEZlZWRiYWNrLm5vdENob3NlbkZlZWRiYWNrICE9PSAnJykge1xuICAgICAgICAgICAgYWRkRmVlZGJhY2soJGUsIGEudGlwc0FuZEZlZWRiYWNrLm5vdENob3NlbkZlZWRiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgZmVlZGJhY2tcbiAgICAgIHZhciBtYXggPSBzZWxmLmdldE1heFNjb3JlKCk7XG5cbiAgICAgIC8vIERpc2FibGUgdGFzayBpZiBtYXhzY29yZSBpcyBhY2hpZXZlZFxuICAgICAgdmFyIGZ1bGxTY29yZSA9IChzY29yZSA9PT0gbWF4KTtcblxuICAgICAgaWYgKGZ1bGxTY29yZSkge1xuICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ2NoZWNrLWFuc3dlcicpO1xuICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ3Nob3ctc29sdXRpb24nKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2hvdyBmZWVkYmFja1xuICAgICAgaWYgKCFza2lwRmVlZGJhY2spIHtcbiAgICAgICAgdGhpcy5zZXRGZWVkYmFjayhnZXRGZWVkYmFja1RleHQoc2NvcmUsIG1heCksIHNjb3JlLCBtYXgsIHBhcmFtcy5VSS5zY29yZUJhckxhYmVsKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgY2hvb3NpbmcgbmV3IGlucHV0LlxuICAgICAqL1xuICAgIHZhciBkaXNhYmxlSW5wdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuaDVwLWFuc3dlcicsICRteURvbSkuYXR0cih7XG4gICAgICAgICdhcmlhLWRpc2FibGVkJzogJ3RydWUnLFxuICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICB9KS5yZW1vdmVBdHRyKCdyb2xlJylcbiAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtY2hlY2tlZCcpO1xuXG4gICAgICAkKCcuaDVwLWFuc3dlcnMnKS5yZW1vdmVBdHRyKCdyb2xlJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgbmV3IGlucHV0LlxuICAgICAqL1xuICAgIHZhciBlbmFibGVJbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJy5oNXAtYW5zd2VyJywgJG15RG9tKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgJ2FyaWEtZGlzYWJsZWQnOiAnZmFsc2UnLFxuICAgICAgICAgICdyb2xlJzogcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPyAncmFkaW8nIDogJ2NoZWNrYm94JyxcbiAgICAgICAgfSk7XG5cbiAgICAgICQoJy5oNXAtYW5zd2VycycpLmF0dHIoJ3JvbGUnLCBwYXJhbXMucm9sZSk7XG4gICAgfTtcblxuICAgIHZhciBjYWxjU2NvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzY29yZSA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGFuc3dlciBvZiBwYXJhbXMudXNlckFuc3dlcnMpIHtcbiAgICAgICAgY29uc3QgY2hvaWNlID0gcGFyYW1zLmFuc3dlcnNbYW5zd2VyXTtcbiAgICAgICAgY29uc3Qgd2VpZ2h0ID0gKGNob2ljZS53ZWlnaHQgIT09IHVuZGVmaW5lZCA/IGNob2ljZS53ZWlnaHQgOiAxKTtcbiAgICAgICAgaWYgKGNob2ljZS5jb3JyZWN0KSB7XG4gICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNjb3JlIC09IHdlaWdodDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNjb3JlIDwgMCkge1xuICAgICAgICBzY29yZSA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoIXBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGggJiYgYmxhbmtJc0NvcnJlY3QpIHtcbiAgICAgICAgc2NvcmUgPSBwYXJhbXMud2VpZ2h0O1xuICAgICAgfVxuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlUG9pbnQpIHtcbiAgICAgICAgc2NvcmUgPSAoMTAwICogc2NvcmUgLyBjYWxjdWxhdGVNYXhTY29yZSgpKSA+PSBwYXJhbXMuYmVoYXZpb3VyLnBhc3NQZXJjZW50YWdlID8gcGFyYW1zLndlaWdodCA6IDA7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgc2VsZWN0aW9ucyBmcm9tIHRhc2suXG4gICAgICovXG4gICAgdmFyIHJlbW92ZVNlbGVjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJGFuc3dlcnMgPSAkKCcuaDVwLWFuc3dlcicsICRteURvbSlcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtc2VsZWN0ZWQnKVxuICAgICAgICAuYXR0cignYXJpYS1jaGVja2VkJywgJ2ZhbHNlJyk7XG5cbiAgICAgIGlmICghcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgJGFuc3dlcnMuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRhbnN3ZXJzLmZpcnN0KCkuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXQgZm9jdXMgdG8gZmlyc3Qgb3B0aW9uXG4gICAgICAkYW5zd2Vycy5maXJzdCgpLmZvY3VzKCk7XG5cbiAgICAgIGNhbGNTY29yZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgeEFQSSBkYXRhLlxuICAgICAqIENvbnRyYWN0IHVzZWQgYnkgcmVwb3J0IHJlbmRlcmluZyBlbmdpbmUuXG4gICAgICpcbiAgICAgKiBAc2VlIGNvbnRyYWN0IGF0IHtAbGluayBodHRwczovL2g1cC5vcmcvZG9jdW1lbnRhdGlvbi9kZXZlbG9wZXJzL2NvbnRyYWN0cyNndWlkZXMtaGVhZGVyLTZ9XG4gICAgICovXG4gICAgdGhpcy5nZXRYQVBJRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB4QVBJRXZlbnQgPSB0aGlzLmNyZWF0ZVhBUElFdmVudFRlbXBsYXRlKCdhbnN3ZXJlZCcpO1xuICAgICAgYWRkUXVlc3Rpb25Ub1hBUEkoeEFQSUV2ZW50KTtcbiAgICAgIGFkZFJlc3BvbnNlVG9YQVBJKHhBUElFdmVudCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0ZW1lbnQ6IHhBUElFdmVudC5kYXRhLnN0YXRlbWVudFxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIHRoZSBxdWVzdGlvbiBpdHNlbGYgdG8gdGhlIGRlZmluaXRpb24gcGFydCBvZiBhbiB4QVBJRXZlbnRcbiAgICAgKi9cbiAgICB2YXIgYWRkUXVlc3Rpb25Ub1hBUEkgPSBmdW5jdGlvbiAoeEFQSUV2ZW50KSB7XG4gICAgICB2YXIgZGVmaW5pdGlvbiA9IHhBUElFdmVudC5nZXRWZXJpZmllZFN0YXRlbWVudFZhbHVlKFsnb2JqZWN0JywgJ2RlZmluaXRpb24nXSk7XG4gICAgICBkZWZpbml0aW9uLmRlc2NyaXB0aW9uID0ge1xuICAgICAgICAvLyBSZW1vdmUgdGFncywgbXVzdCB3cmFwIGluIGRpdiB0YWcgYmVjYXVzZSBqUXVlcnkgMS45IHdpbGwgY3Jhc2ggaWYgdGhlIHN0cmluZyBpc24ndCB3cmFwcGVkIGluIGEgdGFnLlxuICAgICAgICAnZW4tVVMnOiAkKCc8ZGl2PicgKyBwYXJhbXMucXVlc3Rpb24gKyAnPC9kaXY+JykudGV4dCgpXG4gICAgICB9O1xuICAgICAgZGVmaW5pdGlvbi50eXBlID0gJ2h0dHA6Ly9hZGxuZXQuZ292L2V4cGFwaS9hY3Rpdml0aWVzL2NtaS5pbnRlcmFjdGlvbic7XG4gICAgICBkZWZpbml0aW9uLmludGVyYWN0aW9uVHlwZSA9ICdjaG9pY2UnO1xuICAgICAgZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVybiA9IFtdO1xuICAgICAgZGVmaW5pdGlvbi5jaG9pY2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlZmluaXRpb24uY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICAnaWQnOiBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyICsgJycsXG4gICAgICAgICAgJ2Rlc2NyaXB0aW9uJzoge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHRhZ3MsIG11c3Qgd3JhcCBpbiBkaXYgdGFnIGJlY2F1c2UgalF1ZXJ5IDEuOSB3aWxsIGNyYXNoIGlmIHRoZSBzdHJpbmcgaXNuJ3Qgd3JhcHBlZCBpbiBhIHRhZy5cbiAgICAgICAgICAgICdlbi1VUyc6ICQoJzxkaXY+JyArIHBhcmFtcy5hbnN3ZXJzW2ldLnRleHQgKyAnPC9kaXY+JykudGV4dCgpXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAocGFyYW1zLmFuc3dlcnNbaV0uY29ycmVjdCkge1xuICAgICAgICAgIGlmICghcGFyYW1zLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAgICAgaWYgKGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm5bMF0gKz0gJ1ssXSc7XG4gICAgICAgICAgICAgIC8vIFRoaXMgbG9va3MgaW5zYW5lLCBidXQgaXQncyBob3cgeW91IHNlcGFyYXRlIG11bHRpcGxlIGFuc3dlcnNcbiAgICAgICAgICAgICAgLy8gdGhhdCBtdXN0IGFsbCBiZSBjaG9zZW4gdG8gYWNoaWV2ZSBwZXJmZWN0IHNjb3JlLi4uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVybi5wdXNoKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm5bMF0gKz0gcGFyYW1zLmFuc3dlcnNbaV0ub3JpZ2luYWxPcmRlcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWZpbml0aW9uLmNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuLnB1c2goJycgKyBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIHRoZSByZXNwb25zZSBwYXJ0IHRvIGFuIHhBUEkgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WEFQSUV2ZW50fSB4QVBJRXZlbnRcbiAgICAgKiAgVGhlIHhBUEkgZXZlbnQgd2Ugd2lsbCBhZGQgYSByZXNwb25zZSB0b1xuICAgICAqL1xuICAgIHZhciBhZGRSZXNwb25zZVRvWEFQSSA9IGZ1bmN0aW9uICh4QVBJRXZlbnQpIHtcbiAgICAgIHZhciBtYXhTY29yZSA9IHNlbGYuZ2V0TWF4U2NvcmUoKTtcbiAgICAgIHZhciBzdWNjZXNzID0gKDEwMCAqIHNjb3JlIC8gbWF4U2NvcmUpID49IHBhcmFtcy5iZWhhdmlvdXIucGFzc1BlcmNlbnRhZ2U7XG5cbiAgICAgIHhBUElFdmVudC5zZXRTY29yZWRSZXN1bHQoc2NvcmUsIG1heFNjb3JlLCBzZWxmLCB0cnVlLCBzdWNjZXNzKTtcbiAgICAgIGlmIChwYXJhbXMudXNlckFuc3dlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYWxjU2NvcmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocmVzcG9uc2UgIT09ICcnKSB7XG4gICAgICAgICAgcmVzcG9uc2UgKz0gJ1ssXSc7XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uc2UgKz0gaWRNYXAgPT09IHVuZGVmaW5lZCA/IHBhcmFtcy51c2VyQW5zd2Vyc1tpXSA6IGlkTWFwW3BhcmFtcy51c2VyQW5zd2Vyc1tpXV07XG4gICAgICB9XG4gICAgICB4QVBJRXZlbnQuZGF0YS5zdGF0ZW1lbnQucmVzdWx0LnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG1hcCBwb2ludGluZyBmcm9tIG9yaWdpbmFsIGFuc3dlcnMgdG8gc2h1ZmZsZWQgYW5zd2Vyc1xuICAgICAqXG4gICAgICogQHJldHVybiB7bnVtYmVyW119IG1hcCBwb2ludGluZyBmcm9tIG9yaWdpbmFsIGFuc3dlcnMgdG8gc2h1ZmZsZWQgYW5zd2Vyc1xuICAgICAqL1xuICAgIHZhciBnZXRTaHVmZmxlTWFwID0gZnVuY3Rpb24gKCkge1xuICAgICAgcGFyYW1zLmFuc3dlcnMgPSBzaHVmZmxlQXJyYXkocGFyYW1zLmFuc3dlcnMpO1xuXG4gICAgICAvLyBDcmVhdGUgYSBtYXAgZnJvbSB0aGUgbmV3IGlkIHRvIHRoZSBvbGQgb25lXG4gICAgICB2YXIgaWRNYXAgPSBbXTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZE1hcFtpXSA9IHBhcmFtcy5hbnN3ZXJzW2ldLm9yaWdpbmFsT3JkZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gaWRNYXA7XG4gICAgfTtcblxuICAgIC8vIEluaXRpYWxpemF0aW9uIGNvZGVcbiAgICAvLyBSYW5kb21pemUgb3JkZXIsIGlmIHJlcXVlc3RlZFxuICAgIHZhciBpZE1hcDtcbiAgICAvLyBTdG9yZSBvcmlnaW5hbCBvcmRlciBpbiBhbnN3ZXJzXG4gICAgZm9yIChpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyID0gaTtcbiAgICB9XG4gICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIucmFuZG9tQW5zd2Vycykge1xuICAgICAgaWRNYXAgPSBnZXRTaHVmZmxlTWFwKCk7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgd2l0aCBhbiBlbXB0eSBzZXQgb2YgdXNlciBhbnN3ZXJzLlxuICAgIHBhcmFtcy51c2VyQW5zd2VycyA9IFtdO1xuXG4gICAgLy8gUmVzdG9yZSBwcmV2aW91cyBzdGF0ZVxuICAgIGlmIChjb250ZW50RGF0YSAmJiBjb250ZW50RGF0YS5wcmV2aW91c1N0YXRlICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgLy8gUmVzdG9yZSBhbnN3ZXJzXG4gICAgICBpZiAoY29udGVudERhdGEucHJldmlvdXNTdGF0ZS5hbnN3ZXJzKSB7XG4gICAgICAgIGlmICghaWRNYXApIHtcbiAgICAgICAgICBwYXJhbXMudXNlckFuc3dlcnMgPSBjb250ZW50RGF0YS5wcmV2aW91c1N0YXRlLmFuc3dlcnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gVGhlIGFuc3dlcnMgaGF2ZSBiZWVuIHNodWZmbGVkLCBhbmQgd2UgbXVzdCB1c2UgdGhlIGlkIG1hcHBpbmcuXG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbnRlbnREYXRhLnByZXZpb3VzU3RhdGUuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBpZE1hcC5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICBpZiAoaWRNYXBba10gPT09IGNvbnRlbnREYXRhLnByZXZpb3VzU3RhdGUuYW5zd2Vyc1tpXSkge1xuICAgICAgICAgICAgICAgIHBhcmFtcy51c2VyQW5zd2Vycy5wdXNoKGspO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhbGNTY29yZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYXNDaGVja2VkQW5zd2VyID0gZmFsc2U7XG5cbiAgICAvLyBMb29wIHRocm91Z2ggY2hvaWNlc1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBhbnMgPSBwYXJhbXMuYW5zd2Vyc1tqXTtcblxuICAgICAgaWYgKCFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAvLyBTZXQgcm9sZVxuICAgICAgICBhbnMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgICAgIGFucy50YWJpbmRleCA9ICcwJztcbiAgICAgICAgaWYgKHBhcmFtcy51c2VyQW5zd2Vycy5pbmRleE9mKGopICE9PSAtMSkge1xuICAgICAgICAgIGFucy5jaGVja2VkID0gJ3RydWUnO1xuICAgICAgICAgIGhhc0NoZWNrZWRBbnN3ZXIgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gU2V0IHJvbGVcbiAgICAgICAgYW5zLnJvbGUgPSAncmFkaW8nO1xuXG4gICAgICAgIC8vIERldGVybWluZSB0YWJpbmRleCwgY2hlY2tlZCBhbmQgZXh0cmEgY2xhc3Nlc1xuICAgICAgICBpZiAocGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIE5vIGNvcnJlY3QgYW5zd2Vyc1xuICAgICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgYW5zLnRhYmluZGV4ID0gJzAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwYXJhbXMudXNlckFuc3dlcnMuaW5kZXhPZihqKSAhPT0gLTEpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjb3JyZWN0IGNob2ljZVxuICAgICAgICAgIGFucy50YWJpbmRleCA9ICcwJztcbiAgICAgICAgICBhbnMuY2hlY2tlZCA9ICd0cnVlJztcbiAgICAgICAgICBoYXNDaGVja2VkQW5zd2VyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgZGVmYXVsdFxuICAgICAgaWYgKGFucy50YWJpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFucy50YWJpbmRleCA9ICctMSc7XG4gICAgICB9XG4gICAgICBpZiAoYW5zLmNoZWNrZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhbnMuY2hlY2tlZCA9ICdmYWxzZSc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLmNvdW50ZXIgPSAoTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLmNvdW50ZXIgPT09IHVuZGVmaW5lZCA/IDAgOiBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UuY291bnRlciArIDEpO1xuICAgIHBhcmFtcy5yb2xlID0gKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyID8gJ3JhZGlvZ3JvdXAnIDogJ2dyb3VwJyk7XG4gICAgcGFyYW1zLmxhYmVsSWQgPSAnaDVwLW1jcScgKyBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UuY291bnRlcjtcblxuICAgIC8qKlxuICAgICAqIFBhY2sgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGludGVyYWN0aXZpdHkgaW50byBhIG9iamVjdCB0aGF0IGNhbiBiZVxuICAgICAqIHNlcmlhbGl6ZWQuXG4gICAgICpcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgdGhpcy5nZXRDdXJyZW50U3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc3RhdGUgPSB7fTtcbiAgICAgIGlmICghaWRNYXApIHtcbiAgICAgICAgc3RhdGUuYW5zd2VycyA9IHBhcmFtcy51c2VyQW5zd2VycztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBUaGUgYW5zd2VycyBoYXZlIGJlZW4gc2h1ZmZsZWQgYW5kIG11c3QgYmUgbWFwcGVkIGJhY2sgdG8gdGhlaXJcbiAgICAgICAgLy8gb3JpZ2luYWwgSUQuXG4gICAgICAgIHN0YXRlLmFuc3dlcnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBzdGF0ZS5hbnN3ZXJzLnB1c2goaWRNYXBbcGFyYW1zLnVzZXJBbnN3ZXJzW2ldXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdXNlciBoYXMgZ2l2ZW4gYW4gYW5zd2VyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaWdub3JlQ2hlY2tdIElnbm9yZSByZXR1cm5pbmcgdHJ1ZSBmcm9tIHByZXNzaW5nIFwiY2hlY2stYW5zd2VyXCIgYnV0dG9uLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgYW5zd2VyIGlzIGdpdmVuXG4gICAgICovXG4gICAgdGhpcy5nZXRBbnN3ZXJHaXZlbiA9IGZ1bmN0aW9uIChpZ25vcmVDaGVjaykge1xuICAgICAgdmFyIGFuc3dlcmVkID0gaWdub3JlQ2hlY2sgPyBmYWxzZSA6IHRoaXMuYW5zd2VyZWQ7XG4gICAgICByZXR1cm4gYW5zd2VyZWQgfHwgcGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aCA+IDAgfHwgYmxhbmtJc0NvcnJlY3Q7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0U2NvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gc2NvcmU7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gSDVQLmNyZWF0ZVRpdGxlKCh0aGlzLmNvbnRlbnREYXRhICYmIHRoaXMuY29udGVudERhdGEubWV0YWRhdGEgJiYgdGhpcy5jb250ZW50RGF0YS5tZXRhZGF0YS50aXRsZSkgPyB0aGlzLmNvbnRlbnREYXRhLm1ldGFkYXRhLnRpdGxlIDogJ011bHRpcGxlIENob2ljZScpO1xuICAgIH07XG5cbiAgICAkKHNlbGYubG9hZE9ic2VydmVycyhwYXJhbXMpKVxuXG4gIH07XG5cbiAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUXVlc3Rpb24ucHJvdG90eXBlKTtcbiAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE11c2ljTm90YXRpb25NdWx0aUNob2ljZTtcblxuICBmdW5jdGlvbiBzYW5pdGl6ZVhNTFN0cmluZyh4bWwpIHtcbiAgICByZXR1cm4geG1sLnJlcGxhY2UoLyZhbXA7L2csIFwiJlwiKS5yZXBsYWNlKC8mZ3Q7L2csIFwiPlwiKS5yZXBsYWNlKC8mbHQ7L2csIFwiPFwiKS5yZXBsYWNlKC8mcXVvdDsvZywgXCJcXFwiXCIpO1xuICB9XG5cbiAgLyoqXG4gICogTm90YXRpb24gbG9naWNcbiAgKi9cblxuICAvKipcbiAgKiBMb2FkIG9iZXNlcnZlcnMgZm9yIGNoYW5nZXMgaW4gdGhlIGRvbSwgc28gdGhhdCBwYXJhbWV0ZXJzIG9mIHRoZSB2aWJlIGNhbiBiZSB1cGRhdGVkIFxuICAqL1xuICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UucHJvdG90eXBlLmxvYWRPYnNlcnZlcnMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdGhpcy5pbnN0YW5jZVBhc3NlZCA9IGZhbHNlXG4gICAgLy8gZG8gYWxsIHRoZSBpbXBvcnRhbnQgdmliZSBzdHVmZiwgd2hlbiB2aWJlIGlzIHByb3Blcmx5IGxvYWRlZCBhbmQgYXR0YWNoZWRcbiAgICB2YXIgZG9tQXR0YWNoT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobXV0YXRpb24pIHtcbiAgICAgICAgQXJyYXkuZnJvbShtdXRhdGlvbi5hZGRlZE5vZGVzKS5mb3JFYWNoKGFuID0+IHtcbiAgICAgICAgICBpZiAoYW4uY29uc3RydWN0b3IubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKFwiZWxlbWVudFwiKSkge1xuICAgICAgICAgICAgaWYgKGFuLmNsYXNzTGlzdC5jb250YWlucyhcImg1cC1xdWVzdGlvbi1jb250ZW50XCIpICYmIGFuLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaDVwLW11bHRpY2hvaWNlXCIpKSB7XG4gICAgICAgICAgICAgIGlmIChhbi5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaDVwLXZpYmUtY29udGFpbmVyXCIpID09PSBudWxsICYmICF0aGF0Lmluc3RhbmNlUGFzc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5pbnN0YW5jZVBhc3NlZCA9IHRydWVcbiAgICAgICAgICAgICAgICB2YXIgdmliZUNvbnRhaW5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgICAgICAgICB2aWJlQ29udGFpbmVyRGl2LmNsYXNzTGlzdC5hZGQoXCJoNXAtdmliZS1jb250YWluZXJcIilcbiAgICAgICAgICAgICAgICBhbi5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh2aWJlQ29udGFpbmVyRGl2LCBhbilcbiAgICAgICAgICAgICAgICB0aGF0LmxvYWRTVkcocGFyYW1zKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuLmNsYXNzTGlzdC5jb250YWlucyhcIm5vdGF0aW9uXCIpKSB7XG4gICAgICAgICAgICAgIHRoYXQuYWRqdXN0RnJhbWUoYW4pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkb21BdHRhY2hPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LCB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIExvYWRzIFNWRyBmcm9tIHBhcmFtZXRlcnNcbiAgICogcGFyYW1zIG11c3QgY29udGFpbjpcbiAgICogLSBwYXJhbXMucXVlc3Rpb25fbm90YXRpb25fbGlzdFxuICAgKiAtIHBhcmFtcy5hbnN3ZXJzW2ldLmFuc3dlcl9ub3RhdGlvblxuICAgKiBAcGFyYW0geyp9IHBhcmFtcyBcbiAgICovXG4gIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5wcm90b3R5cGUubG9hZFNWRyA9IGFzeW5jIGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcblxuICAgIHZhciByb290Q29udGFpbmVyXG4gICAgaWYgKHBhcmFtcy5xdWVzdGlvbl9pbnN0YW5jZV9udW0gIT0gdW5kZWZpbmVkKSB7XG4gICAgICByb290Q29udGFpbmVyID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucXVlc3Rpb24tY29udGFpbmVyXCIpW3BhcmFtcy5xdWVzdGlvbl9pbnN0YW5jZV9udW1dXG4gICAgICBpZiAocm9vdENvbnRhaW5lci5nZXRBdHRyaWJ1dGUoXCJpbnN0YW5jZS1pZFwiKSA9PT0gbnVsbCkge1xuICAgICAgICByb290Q29udGFpbmVyLnNldEF0dHJpYnV0ZShcImluc3RhbmNlLWlkXCIsIHBhcmFtcy5xdWVzdGlvbl9pbnN0YW5jZV9udW0pXG4gICAgICAgIC8vIHRoYXQuYWN0aXZlUXVlc3Rpb25Db250YWluZXJPYnNlcnZlci5vYnNlcnZlKHJvb3RDb250YWluZXIsIHtcbiAgICAgICAgLy8gICBhdHRyaWJ1dGVzOiB0cnVlXG4gICAgICAgIC8vIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2lmKHJvb3RDb250YWluZXIuZ2V0QXR0cmlidXRlKFwiaW5zdGFuY2UtaWRcIikgPT0gcGFyYW1zLnF1ZXN0aW9uX2luc3RhbmNlX251bSkgcmV0dXJuXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3RDb250YWluZXIgPSB3aW5kb3cuZG9jdW1lbnQuYm9keVxuICAgIH1cblxuICAgIHZhciBxdWVzdGlvbl9jb250YWluZXIgPSByb290Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuaDVwLXZpYmUtY29udGFpbmVyXCIpXG4gICAgLy90aGlzIHdpbGwgcHJldmVudCBsb2FkaW5nIG5vbiB2aXNpYmxlIGNvbnRhaW5lcnMgKGUuZy4gaW4gcXVlc3Rpb24gc2V0LCB2aWJlLWNvbnRhaW5lcnMgd2lsbCBhcHBlYXIgb24gZGlmZmVyZW50IHNsaWRlcylcbiAgICAvLyBpZiAocm9vdENvbnRhaW5lci5jbG9zZXN0KFwiLnF1ZXN0aW9uLWNvbnRhaW5lcltzdHlsZT0nZGlzcGxheTogbm9uZTsnXCIpICE9PSBudWxsKSByZXR1cm5cbiAgICAvLyBpZiAocm9vdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnZpYmUtY29udGFpbmVyXCIpICE9PSBudWxsKSByZXR1cm5cbiAgICBpZiAocGFyYW1zLnF1ZXN0aW9uX25vdGF0aW9uX2xpc3QgIT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5xdWVzdGlvbl9ub3RhdGlvbl9saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghcGFyYW1zLnF1ZXN0aW9uX25vdGF0aW9uX2xpc3RbaV0ubm90YXRpb25XaWRnZXQuaW5jbHVkZXMoXCImbHQ7L3N2Z1wiKSkgY29udGludWUgLy8gVGhlIGJveCBmb3IgdGhlIG5vdGF0aW9uIGlzIGluaXRpYWxpemVkIGJ1dCBpdCBoYXMgbm8gcGFyc2FibGUgc3RyaW5nLiBKdXN0IGNoZWNraW5nIGlmIHN2ZyB0YWcgZXhpc3RzXG4gICAgICAgIHZhciAkdmliZVF1ZXN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICAkdmliZVF1ZXN0aW9uLnNldEF0dHJpYnV0ZShcImlkXCIsICd2aWJlQ2hvaWNlJyArIHRoaXMuZ2VuZXJhdGVVSUQoKSlcbiAgICAgICAgJHZpYmVRdWVzdGlvbi5jbGFzc0xpc3QuYWRkKFwibm90YXRpb25cIilcbiAgICAgICAgdmFyIHN2Z291dCA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoc2FuaXRpemVYTUxTdHJpbmcocGFyYW1zLnF1ZXN0aW9uX25vdGF0aW9uX2xpc3RbaV0ubm90YXRpb25XaWRnZXQpLCBcInRleHQvaHRtbFwiKS5ib2R5LmZpcnN0Q2hpbGRcbiAgICAgICAgc3Znb3V0LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjbWFuaXB1bGF0b3JDYW52YXMsICNzY29yZVJlY3RzLCAjbGFiZWxDYW52YXMsICNwaGFudG9tQ2FudmFzXCIpLmZvckVhY2goYyA9PiBjLnJlbW92ZSgpKVxuICAgICAgICBzdmdvdXQucXVlcnlTZWxlY3RvckFsbChcIi5tYXJrZWQsIC5sYXN0QWRkZWRcIikuZm9yRWFjaChtID0+IHtcbiAgICAgICAgICBtLmNsYXNzTGlzdC5yZW1vdmUoXCJtYXJrZWRcIilcbiAgICAgICAgICBtLmNsYXNzTGlzdC5yZW1vdmUoXCJsYXN0QWRkZWRcIilcbiAgICAgICAgfSlcbiAgICAgICAgLy9zdmdvdXQucXVlcnlTZWxlY3RvckFsbChcInN2Z1wiKS5mb3JFYWNoKHN2ZyA9PiBzdmcuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZSgyLjUpXCIpXG4gICAgICAgICR2aWJlUXVlc3Rpb24uYXBwZW5kKHN2Z291dClcbiAgICAgICAgcXVlc3Rpb25fY29udGFpbmVyLmFwcGVuZENoaWxkKCR2aWJlUXVlc3Rpb24pXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHBhcmFtcy5hbnN3ZXJzW2ldLmFuc3dlcl9ub3RhdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRW1wdHlNRUkocGFyYW1zLmFuc3dlcnNbaV0uYW5zd2VyX25vdGF0aW9uLm5vdGF0aW9uV2lkZ2V0KSkge1xuICAgICAgICAgIHZhciB1dWlkID0gdGhpcy5nZW5lcmF0ZVVJRCgpXG4gICAgICAgICAgdmFyICR2aWJlQW5zd2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICAgICR2aWJlQW5zd2VyLnNldEF0dHJpYnV0ZShcImlkXCIsICd2aWJlQW5zd2VyJyArIHV1aWQpXG4gICAgICAgICAgJHZpYmVBbnN3ZXIuY2xhc3NMaXN0LmFkZChcIm5vdGF0aW9uXCIpXG4gICAgICAgICAgdmFyIGFuc3dlckNvbnRhaW5lciA9IHJvb3RDb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5oNXAtYWx0ZXJuYXRpdmUtY29udGFpbmVyW2Fuc3dlci1pZD0nXCIgKyBpLnRvU3RyaW5nKCkgKyBcIidcIilcbiAgICAgICAgICB2YXIgc3Znb3V0ID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhzYW5pdGl6ZVhNTFN0cmluZyhwYXJhbXMuYW5zd2Vyc1tpXS5hbnN3ZXJfbm90YXRpb24ubm90YXRpb25XaWRnZXQpLCBcInRleHQvaHRtbFwiKS5ib2R5LmZpcnN0Q2hpbGRcbiAgICAgICAgICBzdmdvdXQucXVlcnlTZWxlY3RvckFsbChcIiNtYW5pcHVsYXRvckNhbnZhcywgI3Njb3JlUmVjdHMsICNsYWJlbENhbnZhcywgI3BoYW50b21DYW52YXNcIikuZm9yRWFjaChjID0+IGMucmVtb3ZlKCkpXG4gICAgICAgICAgc3Znb3V0LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWFya2VkLCAubGFzdEFkZGVkXCIpLmZvckVhY2gobSA9PiB7XG4gICAgICAgICAgICBtLmNsYXNzTGlzdC5yZW1vdmUoXCJtYXJrZWRcIilcbiAgICAgICAgICAgIG0uY2xhc3NMaXN0LnJlbW92ZShcImxhc3RBZGRlZFwiKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy9zdmdvdXQucXVlcnlTZWxlY3RvckFsbChcInN2Z1wiKS5mb3JFYWNoKHN2ZyA9PiBzdmcuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZSgyLjUpXCIpXG4gICAgICAgICAgJHZpYmVBbnN3ZXIuYXBwZW5kKHN2Z291dClcbiAgICAgICAgICBhbnN3ZXJDb250YWluZXIuYXBwZW5kQ2hpbGQoJHZpYmVBbnN3ZXIpXG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZpYmVJbnN0YW5jZXNcbiAgfVxuXG4gIC8qKlxuICAgICAqIEFkanVzdCBzaXplcyBhY2NvcmRpbmcgdG8gZGVmaW5pdGlvbi1zY2FsZSBoZWlnaHQgb2YgY29udGVudHMgd2hlbiBhbGwgbmVjZXNzYXJ5IGNvbnRhaW5lcnMgYXJlIGxvYWRlZC5cbiAgICAgKi9cbiAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLnByb3RvdHlwZS5hZGp1c3RGcmFtZSA9IGZ1bmN0aW9uICh2aWJlQ29udGFpbmVyKSB7XG5cbiAgICB2YXIgY29udGFpbmVyU1ZHID0gdmliZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiI3N2Z0NvbnRhaW5lclwiKVxuICAgIGlmIChjb250YWluZXJTVkcgIT09IG51bGwpIHtcbiAgICAgIC8vIHZhciB2YiA9IGNvbnRhaW5lclNWRy5xdWVyeVNlbGVjdG9yKFwiI2ludGVyYWN0aW9uT3ZlcmxheVwiKS5nZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIpPy5zcGxpdChcIiBcIikubWFwKHBhcnNlRmxvYXQpXG4gICAgICAvLyBjb250YWluZXJIZWlnaHQgPSAodmJbM10gKiAxLjI1KS50b1N0cmluZygpICsgXCJweFwiXG4gICAgICAvLyBjb250YWluZXJTVkcuc3R5bGUub3ZlcmZsb3cgPSBcImF1dG9cIlxuXG4gICAgICBpZiAodGhpcy50YXNrQ29udGFpbmVySGVpZ2h0ID09PSAwKSB7XG4gICAgICAgIEFycmF5LmZyb20oY29udGFpbmVyU1ZHLmNoaWxkcmVuKS5mb3JFYWNoKGMgPT4ge1xuICAgICAgICAgIGlmIChjLmlkID09PSBcInNpZGViYXJDb250YWluZXJcIikgcmV0dXJuXG4gICAgICAgICAgaWYoYy5pZCA9PT0gXCJpbnRlcmFjdGlvbk92ZXJsYXlcIil7XG4gICAgICAgICAgICBpZihBcnJheS5mcm9tKGMuY2hpbGRyZW4pLmV2ZXJ5KGNoaWxkID0+IGNoaWxkLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkpIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnRhc2tDb250YWluZXJIZWlnaHQgKz0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgdmliZUNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAodGhpcy50YXNrQ29udGFpbmVySGVpZ2h0ICogMS4zKSArIFwicHhcIiAvL2NvbnRhaW5lckhlaWdodCB8fCBcIjIwcmVtXCJcbiAgICB2aWJlQ29udGFpbmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCJcblxuXG4gICAgLy8gdmFyIGg1cENvbnRhaW5lciA9IHZpYmVDb250YWluZXIucGFyZW50RWxlbWVudCAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaDVwLXZpYmUtY29udGFpbmVyXCIpXG4gICAgLy8gdmFyIHNob3dDaGlsZHJlbiA9IGg1cENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpYmUtY29udGFpbmVyXCIpXG4gICAgLy8gdmFyIGg1cENvbnRhaW5lckhlaWdodCA9IHBhcnNlRmxvYXQoaDVwQ29udGFpbmVyLnN0eWxlLmhlaWd0aCkgfHwgMFxuICAgIC8vIHNob3dDaGlsZHJlbi5mb3JFYWNoKHNjID0+IHtcbiAgICAvLyAgIGg1cENvbnRhaW5lckhlaWdodCArPSBzYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHRcbiAgICAvLyAgIHNjLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiIC8vIHZlcnkgaW1wb3J0YW50LCBzbyB0aGF0IHRoZSBjb250YWluZXJzIGFyZSBkaXNwbGF5ZWQgaW4gdGhlIHNhbWUgY29sdW1uXG4gICAgLy8gfSlcbiAgICAvLyBoNXBDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gaDVwQ29udGFpbmVySGVpZ2h0LnRvU3RyaW5nKCkgKyBcInB4XCJcbiAgICAvLyB3aW5kb3cuZnJhbWVFbGVtZW50LnN0eWxlLmhlaWdodCA9IChwYXJzZUZsb2F0KHdpbmRvdy5mcmFtZUVsZW1lbnQuc3R5bGUuaGVpZ2h0KSArIGg1cENvbnRhaW5lckhlaWdodCAvIDEpLnRvU3RyaW5nKCkgKyBcInB4XCJcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBnaXZlbiBNRUkgaXMganVzdCBlbXB0eS5cbiAgICogRW1wdHkgbWVhbnM6IE9ubHkgb25lIGxheWVyIHdpdGggb25lIG1SZXN0LiBUaGlzIGlzIHRoZSBkZWZhdWx0IG5vdGF0aW9uIHNldHVwIHdpdGhvdXQgY2hhbmdpbmcgYW55dGhpbmcuXG4gICAqIEBwYXJhbSB7Kn0gbWVpIFxuICAgKiBAcmV0dXJucyBcbiAgICovXG4gIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5wcm90b3R5cGUuaXNFbXB0eU1FSSA9IGZ1bmN0aW9uIChtZWkpIHtcbiAgICAvL2NvbnZlcnQgc3RyaW5nIGZvciBwcm9wZXIgcGFyc2luZ1xuICAgIGlmICghbWVpKSByZXR1cm4gdHJ1ZVxuICAgIG1laSA9IG1laS5yZXBsYWNlKC9cXG4vZywgXCJcIik7IC8vIGRlbGV0ZSBhbGwgdW5uZWNlc3NhcnkgbmV3bGluZVxuICAgIG1laSA9IG1laS5yZXBsYWNlKC9cXHN7Mix9L2csIFwiXCIpOyAvLyBkZWxldGUgYWxsIHVubmVjZXNzYXJ5IHdoaXRlc3BhY2VzXG4gICAgbWVpID0gbWVpLnJlcGxhY2UoLyZhbXA7L2csIFwiJlwiKS5yZXBsYWNlKC8mZ3Q7L2csIFwiPlwiKS5yZXBsYWNlKC8mbHQ7L2csIFwiPFwiKS5yZXBsYWNlKC8mcXVvdDsvZywgXCJcXFwiXCIpO1xuXG4gICAgdmFyIHBhcnNlciA9IG5ldyBET01QYXJzZXIoKVxuICAgIHZhciB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKG1laSwgXCJ0ZXh0L3htbFwiKVxuICAgIHJldHVybiB4bWxEb2MucXVlcnlTZWxlY3RvckFsbChcImxheWVyXCIpLmxlbmd0aCA9PT0gMSAmJiB4bWxEb2MucXVlcnlTZWxlY3RvcihcImxheWVyIG1SZXN0XCIpICE9PSBudWxsXG4gIH1cblxuICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UucHJvdG90eXBlLmdlbmVyYXRlVUlEID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaXJzdFBhcnQgPSAoKE1hdGgucmFuZG9tKCkgKiA0NjY1NikgfCAwKS50b1N0cmluZygzNilcbiAgICB2YXIgc2Vjb25kUGFydCA9ICgoTWF0aC5yYW5kb20oKSAqIDQ2NjU2KSB8IDApLnRvU3RyaW5nKDM2KVxuICAgIGZpcnN0UGFydCA9IChcIjAwMFwiICsgZmlyc3RQYXJ0KS5zbGljZSgtMyk7XG4gICAgc2Vjb25kUGFydCA9IChcIjAwMFwiICsgc2Vjb25kUGFydCkuc2xpY2UoLTMpO1xuICAgIHJldHVybiBmaXJzdFBhcnQgKyBzZWNvbmRQYXJ0O1xuICB9XG5cbiAgcmV0dXJuIE11c2ljTm90YXRpb25NdWx0aUNob2ljZVxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgTU5NQyIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFwiLi4vY3NzL211c2ljbm90YXRpb24tbXVsdGljaG9pY2UuY3NzXCJcbmltcG9ydCBNTk1DIGZyb20gXCIuLi9qcy9tdXNpY25vdGF0aW9uLW11bHRpY2hvaWNlLmpzXCJcblxuLy8gTG9hZCBsaWJyYXJ5XG5INVAgPSBINVAgfHwge307XG5INVAuTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlID0gTU5NQztcbiJdLCJuYW1lcyI6WyJFdmVudERpc3BhdGNoZXIiLCJINVAiLCJqUXVlcnkiLCJKb3ViZWxVSSIsIlF1ZXN0aW9uIiwic2h1ZmZsZUFycmF5IiwiJCIsIlVJIiwiTU5NQyIsIk11c2ljTm90YXRpb25NdWx0aUNob2ljZSIsIm9wdGlvbnMiLCJjb250ZW50SWQiLCJjb250ZW50RGF0YSIsInNlbGYiLCJjYWxsIiwidGFza0NvbnRhaW5lckhlaWdodCIsImRlZmF1bHRzIiwiaW1hZ2UiLCJxdWVzdGlvbiIsImFuc3dlcnMiLCJ0aXBzQW5kRmVlZGJhY2siLCJ0aXAiLCJjaG9zZW5GZWVkYmFjayIsIm5vdENob3NlbkZlZWRiYWNrIiwidGV4dCIsImNvcnJlY3QiLCJvdmVyYWxsRmVlZGJhY2siLCJ3ZWlnaHQiLCJ1c2VyQW5zd2VycyIsImNoZWNrQW5zd2VyQnV0dG9uIiwic3VibWl0QW5zd2VyQnV0dG9uIiwic2hvd1NvbHV0aW9uQnV0dG9uIiwidHJ5QWdhaW5CdXR0b24iLCJzY29yZUJhckxhYmVsIiwidGlwQXZhaWxhYmxlIiwiZmVlZGJhY2tBdmFpbGFibGUiLCJyZWFkRmVlZGJhY2siLCJzaG91bGRDaGVjayIsInNob3VsZE5vdENoZWNrIiwibm9JbnB1dCIsImExMXlDaGVjayIsImExMXlTaG93U29sdXRpb24iLCJhMTF5UmV0cnkiLCJiZWhhdmlvdXIiLCJlbmFibGVSZXRyeSIsImVuYWJsZVNvbHV0aW9uc0J1dHRvbiIsImVuYWJsZUNoZWNrQnV0dG9uIiwidHlwZSIsInNpbmdsZVBvaW50IiwicmFuZG9tQW5zd2VycyIsInNob3dTb2x1dGlvbnNSZXF1aXJlc0lucHV0IiwiYXV0b0NoZWNrIiwicGFzc1BlcmNlbnRhZ2UiLCJzaG93U2NvcmVQb2ludHMiLCJwYXJhbXMiLCJleHRlbmQiLCJjb25zb2xlIiwibG9nIiwibnVtQ29ycmVjdCIsImkiLCJsZW5ndGgiLCJhbnN3ZXIiLCJibGFua0lzQ29ycmVjdCIsInNpbmdsZUFuc3dlciIsImdldENoZWNrYm94T3JSYWRpb0ljb24iLCJyYWRpbyIsInNlbGVjdGVkIiwiaWNvbiIsIiRteURvbSIsIiRmZWVkYmFja0RpYWxvZyIsInJlbW92ZUZlZWRiYWNrRGlhbG9nIiwidW5iaW5kIiwiZmluZCIsInJlbW92ZSIsInJlbW92ZUNsYXNzIiwic2NvcmUiLCJzb2x1dGlvbnNWaXNpYmxlIiwiYWRkRmVlZGJhY2siLCIkZWxlbWVudCIsImZlZWRiYWNrIiwiYXBwZW5kVG8iLCJhZGRDbGFzcyIsInJlZ2lzdGVyRG9tRWxlbWVudHMiLCJtZWRpYSIsImxpYnJhcnkiLCJzcGxpdCIsImZpbGUiLCJzZXRJbWFnZSIsInBhdGgiLCJkaXNhYmxlSW1hZ2Vab29taW5nIiwiYWx0IiwidGl0bGUiLCJzb3VyY2VzIiwic2V0VmlkZW8iLCJmaWxlcyIsInNldEF1ZGlvIiwiY2hlY2tib3hPclJhZGlvSWNvbiIsImluZGV4T2YiLCJzZXRJbnRyb2R1Y3Rpb24iLCJsYWJlbElkIiwicm9sZSIsInRhYmluZGV4IiwiY2hlY2tlZCIsImh0bWwiLCJ0b1N0cmluZyIsInNldENvbnRlbnQiLCIkYW5zd2VycyIsImVhY2giLCJ1bmRlZmluZWQiLCJ0cmltIiwidGlwQ29udGVudCIsInJlcGxhY2UiLCIkd3JhcCIsIiRtdWx0aWNob2ljZVRpcCIsInRpcHNMYWJlbCIsInRpcEljb25IdG1sIiwiYXBwZW5kIiwiY2xpY2siLCIkdGlwQ29udGFpbmVyIiwicGFyZW50cyIsIm9wZW5GZWVkYmFjayIsImNoaWxkcmVuIiwiaXMiLCJhdHRyIiwicmVhZCIsInRyaWdnZXIiLCJzZXRUaW1lb3V0Iiwia2V5ZG93biIsImUiLCJ3aGljaCIsInRvZ2dsZUNoZWNrIiwiJGFucyIsImFuc3dlcmVkIiwibnVtIiwicGFyc2VJbnQiLCJkYXRhIiwibm90IiwicG9zIiwic3BsaWNlIiwicHVzaCIsImNhbGNTY29yZSIsInRyaWdnZXJYQVBJIiwiaGlkZVNvbHV0aW9uIiwic2hvd0J1dHRvbiIsImhpZGVCdXR0b24iLCJjaGVja0Fuc3dlciIsInNob3dDaGVja1NvbHV0aW9uIiwiZ2V0TWF4U2NvcmUiLCJrZXlDb2RlIiwiJHByZXYiLCJwcmV2IiwiZm9jdXMiLCIkbmV4dCIsIm5leHQiLCJibHVyIiwiZmlsdGVyIiwiZmlyc3QiLCJhZGQiLCJsYXN0IiwiYWRkQnV0dG9ucyIsImhhc0NoZWNrZWRBbnN3ZXIiLCJzaG93QWxsU29sdXRpb25zIiwiJGUiLCJhIiwiY2xhc3NOYW1lIiwiZGlzYWJsZUlucHV0Iiwic2hvd1NvbHV0aW9ucyIsIiRhbnN3ZXIiLCJoaWRlU29sdXRpb25zIiwicmVtb3ZlRmVlZGJhY2siLCJyZXNldFRhc2siLCJyZW1vdmVTZWxlY3Rpb25zIiwiZW5hYmxlSW5wdXQiLCJjYWxjdWxhdGVNYXhTY29yZSIsIm1heFNjb3JlIiwiY2hvaWNlIiwieEFQSUV2ZW50IiwiY3JlYXRlWEFQSUV2ZW50VGVtcGxhdGUiLCJhZGRRdWVzdGlvblRvWEFQSSIsImFkZFJlc3BvbnNlVG9YQVBJIiwiJGNvbnRlbnQiLCIkY29udGFpbmVyUGFyZW50cyIsIiRjb250YWluZXIiLCJkb2N1bWVudCIsImJvZHkiLCJhZGRCdXR0b24iLCJnZXRBbnN3ZXJHaXZlbiIsInVwZGF0ZUZlZWRiYWNrQ29udGVudCIsImNvbmZpcm1hdGlvbkRpYWxvZyIsImVuYWJsZSIsImNvbmZpcm1DaGVja0RpYWxvZyIsImwxMG4iLCJjb25maXJtQ2hlY2siLCJpbnN0YW5jZSIsIiRwYXJlbnRFbGVtZW50IiwidGV4dElmU3VibWl0dGluZyIsIm9sZElkTWFwIiwiaWRNYXAiLCJnZXRTaHVmZmxlTWFwIiwiYW5zd2Vyc0Rpc3BsYXllZCIsImRldGFjaCIsImNvbmZpcm1SZXRyeURpYWxvZyIsImNvbmZpcm1SZXRyeSIsImdldEZlZWRiYWNrVGV4dCIsIm1heCIsInJhdGlvIiwiZGV0ZXJtaW5lT3ZlcmFsbEZlZWRiYWNrIiwic2tpcEZlZWRiYWNrIiwic2NvcmVQb2ludHMiLCJTY29yZVBvaW50cyIsImNob3NlbiIsImhhc0NsYXNzIiwiY29ycmVjdEFuc3dlciIsIndyb25nQW5zd2VyIiwiYWx0ZXJuYXRpdmVDb250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwiYXBwZW5kQ2hpbGQiLCJnZXRFbGVtZW50IiwiZnVsbFNjb3JlIiwic2V0RmVlZGJhY2siLCJyZW1vdmVBdHRyIiwiZ2V0WEFQSURhdGEiLCJzdGF0ZW1lbnQiLCJkZWZpbml0aW9uIiwiZ2V0VmVyaWZpZWRTdGF0ZW1lbnRWYWx1ZSIsImRlc2NyaXB0aW9uIiwiaW50ZXJhY3Rpb25UeXBlIiwiY29ycmVjdFJlc3BvbnNlc1BhdHRlcm4iLCJjaG9pY2VzIiwib3JpZ2luYWxPcmRlciIsInN1Y2Nlc3MiLCJzZXRTY29yZWRSZXN1bHQiLCJyZXNwb25zZSIsInJlc3VsdCIsInByZXZpb3VzU3RhdGUiLCJrIiwiaiIsImFucyIsImNvdW50ZXIiLCJnZXRDdXJyZW50U3RhdGUiLCJzdGF0ZSIsImlnbm9yZUNoZWNrIiwiZ2V0U2NvcmUiLCJnZXRUaXRsZSIsImNyZWF0ZVRpdGxlIiwibWV0YWRhdGEiLCJsb2FkT2JzZXJ2ZXJzIiwicHJvdG90eXBlIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJzYW5pdGl6ZVhNTFN0cmluZyIsInhtbCIsInRoYXQiLCJpbnN0YW5jZVBhc3NlZCIsImRvbUF0dGFjaE9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsImZvckVhY2giLCJtdXRhdGlvbiIsIkFycmF5IiwiZnJvbSIsImFkZGVkTm9kZXMiLCJhbiIsIm5hbWUiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJwYXJlbnRFbGVtZW50IiwidmliZUNvbnRhaW5lckRpdiIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwibG9hZFNWRyIsImFkanVzdEZyYW1lIiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJyb290Q29udGFpbmVyIiwicXVlc3Rpb25faW5zdGFuY2VfbnVtIiwid2luZG93IiwicXVlcnlTZWxlY3RvckFsbCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInF1ZXN0aW9uX2NvbnRhaW5lciIsInF1ZXN0aW9uX25vdGF0aW9uX2xpc3QiLCJub3RhdGlvbldpZGdldCIsIiR2aWJlUXVlc3Rpb24iLCJnZW5lcmF0ZVVJRCIsInN2Z291dCIsIkRPTVBhcnNlciIsInBhcnNlRnJvbVN0cmluZyIsImZpcnN0Q2hpbGQiLCJjIiwibSIsImFuc3dlcl9ub3RhdGlvbiIsImlzRW1wdHlNRUkiLCJ1dWlkIiwiJHZpYmVBbnN3ZXIiLCJhbnN3ZXJDb250YWluZXIiLCJ2aWJlSW5zdGFuY2VzIiwidmliZUNvbnRhaW5lciIsImNvbnRhaW5lclNWRyIsImlkIiwiZXZlcnkiLCJjaGlsZCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImhlaWdodCIsInN0eWxlIiwid2lkdGgiLCJtZWkiLCJwYXJzZXIiLCJ4bWxEb2MiLCJmaXJzdFBhcnQiLCJNYXRoIiwicmFuZG9tIiwic2Vjb25kUGFydCIsInNsaWNlIl0sInNvdXJjZVJvb3QiOiIifQ==