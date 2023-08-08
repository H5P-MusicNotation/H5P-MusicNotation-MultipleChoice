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

/***/ "./js/multichoice.js":
/*!***************************!*\
  !*** ./js/multichoice.js ***!
  \***************************/
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
 * @returns {MultiChoiceScore4LMS}
 * @constructor
 */

//import VerovioScoreEditor from "verovioscoreeditor";

const MCS4L = function () {
  /**
   * @param {*} options 
   * @param {*} contentId 
   * @param {*} contentData 
   * @returns 
   */
  function MultiChoiceScore4LMS(options, contentId, contentData) {
    if (!(this instanceof MultiChoiceScore4LMS)) return new MultiChoiceScore4LMS(options, contentId, contentData);
    var self = this;
    this.contentId = contentId;
    this.contentData = contentData;
    _globals__WEBPACK_IMPORTED_MODULE_0__.Question.call(self, 'multichoice');
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
    // this.vseContainer = []
    // this.vseInstances = []

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
    MultiChoiceScore4LMS.counter = MultiChoiceScore4LMS.counter === undefined ? 0 : MultiChoiceScore4LMS.counter + 1;
    params.role = params.behaviour.singleAnswer ? 'radiogroup' : 'group';
    params.labelId = 'h5p-mcq' + MultiChoiceScore4LMS.counter;

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
  MultiChoiceScore4LMS.prototype = Object.create(_globals__WEBPACK_IMPORTED_MODULE_0__.Question.prototype);
  MultiChoiceScore4LMS.prototype.constructor = MultiChoiceScore4LMS;
  function sanitizeXMLString(xml) {
    return xml.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
  }

  /**
  * Notation logic
  */

  /**
  * Load obeservers for changes in the dom, so that parameters of the vse can be updated 
  */
  MultiChoiceScore4LMS.prototype.loadObservers = function (params) {
    var that = this;
    this.instancePassed = false;
    // do all the important vse stuff, when vse is properly loaded and attached
    var domAttachObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.from(mutation.addedNodes).forEach(an => {
          if (an.constructor.name.toLowerCase().includes("element")) {
            if (an.classList.contains("h5p-question-content") && an.parentElement.classList.contains("h5p-multichoice")) {
              if (an.parentElement.querySelector(".h5p-vse-container") === null && !that.instancePassed) {
                that.instancePassed = true;
                var vseContainerDiv = document.createElement("div");
                vseContainerDiv.classList.add("h5p-vse-container");
                an.parentNode.insertBefore(vseContainerDiv, an);
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
  MultiChoiceScore4LMS.prototype.loadSVG = async function (params) {
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
    var question_container = rootContainer.querySelector(".h5p-vse-container");
    //this will prevent loading non visible containers (e.g. in question set, vse-containers will appear on different slides)
    // if (rootContainer.closest(".question-container[style='display: none;'") !== null) return
    // if (rootContainer.querySelector(".vse-container") !== null) return
    if (params.question_notation_list != undefined) {
      for (var i = 0; i < params.question_notation_list.length; i++) {
        var $vseQuestion = document.createElement("div");
        $vseQuestion.setAttribute("id", 'vseChoice' + this.generateUID());
        $vseQuestion.classList.add("notation");
        var svgout = new DOMParser().parseFromString(sanitizeXMLString(params.question_notation_list[i].notationWidget), "text/html").body.firstChild;
        svgout.querySelectorAll("#manipulatorCanvas, #scoreRects, #labelCanvas, #phantomCanvas").forEach(c => c.remove());
        svgout.querySelectorAll(".marked, .lastAdded").forEach(m => {
          m.classList.remove("marked");
          m.classList.remove("lastAdded");
        });
        //svgout.querySelectorAll("svg").forEach(svg => svg.style.transform = "scale(2.5)")
        $vseQuestion.append(svgout);
        question_container.appendChild($vseQuestion);
      }
    }
    for (var i = 0; i < params.answers.length; i++) {
      if (params.answers[i].answer_notation != undefined) {
        if (!this.isEmptyMEI(params.answers[i].answer_notation.notationWidget)) {
          var uuid = this.generateUID();
          var $vseAnswer = document.createElement("div");
          $vseAnswer.setAttribute("id", 'vseAnswer' + uuid);
          $vseAnswer.classList.add("notation");
          var answerContainer = rootContainer.querySelector(".h5p-alternative-container[answer-id='" + i.toString() + "'");
          var svgout = new DOMParser().parseFromString(sanitizeXMLString(params.answers[i].answer_notation.notationWidget), "text/html").body.firstChild;
          svgout.querySelectorAll("#manipulatorCanvas, #scoreRects, #labelCanvas, #phantomCanvas").forEach(c => c.remove());
          svgout.querySelectorAll(".marked, .lastAdded").forEach(m => {
            m.classList.remove("marked");
            m.classList.remove("lastAdded");
          });
          //svgout.querySelectorAll("svg").forEach(svg => svg.style.transform = "scale(2.5)")
          $vseAnswer.append(svgout);
          answerContainer.appendChild($vseAnswer);
        }
      }
    }
    return this.vseInstances;
  };

  /**
     * Adjust sizes according to definition-scale height of contents when all necessary containers are loaded.
     */
  MultiChoiceScore4LMS.prototype.adjustFrame = function (vseContainer) {
    var containerSVG = vseContainer.querySelector("#vrvSVG"); //("#rootSVG .definition-scale")
    var containerHeight;
    if (containerSVG !== null) {
      containerHeight = containerSVG.getBoundingClientRect().height * 1.1;
      containerHeight = containerHeight.toString() + "px";
    }
    vseContainer.style.height = containerHeight || "20rem";

    // var h5pContainer = vseContainer.parentElement //document.querySelector(".h5p-vse-container")
    // var showChildren = h5pContainer.querySelectorAll(".vse-container")
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
  MultiChoiceScore4LMS.prototype.isEmptyMEI = function (mei) {
    //convert string for proper parsing
    mei = mei.replace(/\n/g, ""); // delete all unnecessary newline
    mei = mei.replace(/\s{2,}/g, ""); // delete all unnecessary whitespaces
    mei = mei.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(mei, "text/xml");
    return xmlDoc.querySelectorAll("layer").length === 1 && xmlDoc.querySelector("layer mRest") !== null;
  };
  MultiChoiceScore4LMS.prototype.generateUID = function () {
    var firstPart = (Math.random() * 46656 | 0).toString(36);
    var secondPart = (Math.random() * 46656 | 0).toString(36);
    firstPart = ("000" + firstPart).slice(-3);
    secondPart = ("000" + secondPart).slice(-3);
    return firstPart + secondPart;
  };
  return MultiChoiceScore4LMS;
}();
/* harmony default export */ __webpack_exports__["default"] = (MCS4L);

/***/ }),

/***/ "./css/multichoice.css":
/*!*****************************!*\
  !*** ./css/multichoice.css ***!
  \*****************************/
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
/* harmony import */ var _css_multichoice_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/multichoice.css */ "./css/multichoice.css");
/* harmony import */ var _js_multichoice_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../js/multichoice.js */ "./js/multichoice.js");



// Load library
H5P = H5P || {};
H5P.MultiChoiceScore4LMS = _js_multichoice_js__WEBPACK_IMPORTED_MODULE_1__["default"];
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEVBQUVDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQyxPQUFPSixTQUFTLEdBQUdHLFVBQVU7RUFDL0IsQ0FBQztFQUVELE9BQU9oVCxvQkFBb0I7QUFDN0IsQ0FBQyxFQUFHO0FBRUosK0RBQWVELEtBQUs7Ozs7Ozs7Ozs7O0FDOXdDcEI7Ozs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ04rQjtBQUNTOztBQUV4QztBQUNBUCxHQUFHLEdBQUdBLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDZkEsR0FBRyxDQUFDUSxvQkFBb0IsR0FBR0QsMERBQUssQyIsInNvdXJjZXMiOlsid2VicGFjazovL3M0bG1zX211bHRpY2hvaWNlLy4vanMvZ2xvYmFscy5qcyIsIndlYnBhY2s6Ly9zNGxtc19tdWx0aWNob2ljZS8uL2pzL211bHRpY2hvaWNlLmpzIiwid2VicGFjazovL3M0bG1zX211bHRpY2hvaWNlLy4vY3NzL211bHRpY2hvaWNlLmNzcyIsIndlYnBhY2s6Ly9zNGxtc19tdWx0aWNob2ljZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zNGxtc19tdWx0aWNob2ljZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vczRsbXNfbXVsdGljaG9pY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zNGxtc19tdWx0aWNob2ljZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3M0bG1zX211bHRpY2hvaWNlLy4vZW50cmllcy9lbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgRXZlbnREaXNwYXRjaGVyID0gSDVQLkV2ZW50RGlzcGF0Y2hlcjtcbmV4cG9ydCBjb25zdCBqUXVlcnkgPSBINVAualF1ZXJ5O1xuZXhwb3J0IGNvbnN0IEpvdWJlbFVJID0gSDVQLkpvdWJlbFVJO1xuZXhwb3J0IGNvbnN0IFF1ZXN0aW9uID0gSDVQLlF1ZXN0aW9uO1xuZXhwb3J0IGNvbnN0IHNodWZmbGVBcnJheSA9IEg1UC5zaHVmZmxlQXJyYXk7IiwiLy8gV2lsbCByZW5kZXIgYSBRdWVzdGlvbiB3aXRoIG11bHRpcGxlIGNob2ljZXMgZm9yIGFuc3dlcnMuXG4vLyBPcHRpb25zIGZvcm1hdDpcbi8vIHtcbi8vICAgdGl0bGU6IFwiT3B0aW9uYWwgdGl0bGUgZm9yIHF1ZXN0aW9uIGJveFwiLFxuLy8gICBxdWVzdGlvbjogXCJRdWVzdGlvbiB0ZXh0XCIsXG4vLyAgIGFuc3dlcnM6IFt7dGV4dDogXCJBbnN3ZXIgdGV4dFwiLCBjb3JyZWN0OiBmYWxzZX0sIC4uLl0sXG4vLyAgIHNpbmdsZUFuc3dlcjogdHJ1ZSwgLy8gb3IgZmFsc2UsIHdpbGwgY2hhbmdlIHJlbmRlcmVkIG91dHB1dCBzbGlnaHRseS5cbi8vICAgc2luZ2xlUG9pbnQ6IHRydWUsICAvLyBUcnVlIGlmIHF1ZXN0aW9uIGdpdmUgYSBzaW5nbGUgcG9pbnQgc2NvcmUgb25seVxuLy8gICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGFsbCBhcmUgY29ycmVjdCwgZmFsc2UgdG8gZ2l2ZSAxIHBvaW50IHBlclxuLy8gICAgICAgICAgICAgICAgICAgICAgIC8vIGNvcnJlY3QgYW5zd2VyLiAoT25seSBmb3Igc2luZ2xlQW5zd2VyPWZhbHNlKVxuLy8gICByYW5kb21BbnN3ZXJzOiBmYWxzZSAgLy8gV2hldGhlciB0byByYW5kb21pemUgdGhlIG9yZGVyIG9mIGFuc3dlcnMuXG4vLyB9XG4vL1xuLy8gRXZlbnRzIHByb3ZpZGVkOlxuLy8gLSBoNXBRdWVzdGlvbkFuc3dlcmVkOiBUcmlnZ2VyZWQgd2hlbiBhIHF1ZXN0aW9uIGhhcyBiZWVuIGFuc3dlcmVkLlxuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE9wdGlvbnNcbiAqICAgT3B0aW9ucyBmb3IgbXVsdGlwbGUgY2hvaWNlXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IGJlaGF2aW91clxuICogQHByb3BlcnR5IHtib29sZWFufSBiZWhhdmlvdXIuY29uZmlybUNoZWNrRGlhbG9nXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGJlaGF2aW91ci5jb25maXJtUmV0cnlEaWFsb2dcbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gVUlcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBVSS50aXBzTGFiZWxcbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gW2NvbmZpcm1SZXRyeV1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybVJldHJ5LmhlYWRlcl1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybVJldHJ5LmJvZHldXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1SZXRyeS5jYW5jZWxMYWJlbF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybVJldHJ5LmNvbmZpcm1MYWJlbF1cbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gW2NvbmZpcm1DaGVja11cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybUNoZWNrLmhlYWRlcl1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybUNoZWNrLmJvZHldXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1DaGVjay5jYW5jZWxMYWJlbF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybUNoZWNrLmNvbmZpcm1MYWJlbF1cbiAqL1xuXG4vKipcbiAqIE1vZHVsZSBmb3IgY3JlYXRpbmcgYSBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25cbiAqXG4gKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb250ZW50SWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZW50RGF0YVxuICogQHJldHVybnMge011bHRpQ2hvaWNlU2NvcmU0TE1TfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cblxuLy9pbXBvcnQgVmVyb3Zpb1Njb3JlRWRpdG9yIGZyb20gXCJ2ZXJvdmlvc2NvcmVlZGl0b3JcIjtcbmltcG9ydCB7XG4gIGpRdWVyeSBhcyAkLCBKb3ViZWxVSSBhcyBVSSwgUXVlc3Rpb24sIHNodWZmbGVBcnJheVxufVxuICBmcm9tIFwiLi9nbG9iYWxzXCI7XG5cbmNvbnN0IE1DUzRMID0gKGZ1bmN0aW9uICgpIHtcblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zIFxuICAgKiBAcGFyYW0geyp9IGNvbnRlbnRJZCBcbiAgICogQHBhcmFtIHsqfSBjb250ZW50RGF0YSBcbiAgICogQHJldHVybnMgXG4gICAqL1xuICBmdW5jdGlvbiBNdWx0aUNob2ljZVNjb3JlNExNUyhvcHRpb25zLCBjb250ZW50SWQsIGNvbnRlbnREYXRhKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE11bHRpQ2hvaWNlU2NvcmU0TE1TKSlcbiAgICAgIHJldHVybiBuZXcgTXVsdGlDaG9pY2VTY29yZTRMTVMob3B0aW9ucywgY29udGVudElkLCBjb250ZW50RGF0YSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuY29udGVudElkID0gY29udGVudElkO1xuICAgIHRoaXMuY29udGVudERhdGEgPSBjb250ZW50RGF0YTtcbiAgICBRdWVzdGlvbi5jYWxsKHNlbGYsICdtdWx0aWNob2ljZScpO1xuXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgaW1hZ2U6IG51bGwsXG4gICAgICBxdWVzdGlvbjogXCJObyBxdWVzdGlvbiB0ZXh0IHByb3ZpZGVkXCIsXG4gICAgICBhbnN3ZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0aXBzQW5kRmVlZGJhY2s6IHtcbiAgICAgICAgICAgIHRpcDogJycsXG4gICAgICAgICAgICBjaG9zZW5GZWVkYmFjazogJycsXG4gICAgICAgICAgICBub3RDaG9zZW5GZWVkYmFjazogJydcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRleHQ6IFwiQW5zd2VyIDFcIixcbiAgICAgICAgICBjb3JyZWN0OiB0cnVlXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBvdmVyYWxsRmVlZGJhY2s6IFtdLFxuICAgICAgd2VpZ2h0OiAxLFxuICAgICAgdXNlckFuc3dlcnM6IFtdLFxuICAgICAgVUk6IHtcbiAgICAgICAgY2hlY2tBbnN3ZXJCdXR0b246ICdDaGVjaycsXG4gICAgICAgIHN1Ym1pdEFuc3dlckJ1dHRvbjogJ1N1Ym1pdCcsXG4gICAgICAgIHNob3dTb2x1dGlvbkJ1dHRvbjogJ1Nob3cgc29sdXRpb24nLFxuICAgICAgICB0cnlBZ2FpbkJ1dHRvbjogJ1RyeSBhZ2FpbicsXG4gICAgICAgIHNjb3JlQmFyTGFiZWw6ICdZb3UgZ290IDpudW0gb3V0IG9mIDp0b3RhbCBwb2ludHMnLFxuICAgICAgICB0aXBBdmFpbGFibGU6IFwiVGlwIGF2YWlsYWJsZVwiLFxuICAgICAgICBmZWVkYmFja0F2YWlsYWJsZTogXCJGZWVkYmFjayBhdmFpbGFibGVcIixcbiAgICAgICAgcmVhZEZlZWRiYWNrOiAnUmVhZCBmZWVkYmFjaycsXG4gICAgICAgIHNob3VsZENoZWNrOiBcIlNob3VsZCBoYXZlIGJlZW4gY2hlY2tlZFwiLFxuICAgICAgICBzaG91bGROb3RDaGVjazogXCJTaG91bGQgbm90IGhhdmUgYmVlbiBjaGVja2VkXCIsXG4gICAgICAgIG5vSW5wdXQ6ICdJbnB1dCBpcyByZXF1aXJlZCBiZWZvcmUgdmlld2luZyB0aGUgc29sdXRpb24nLFxuICAgICAgICBhMTF5Q2hlY2s6ICdDaGVjayB0aGUgYW5zd2Vycy4gVGhlIHJlc3BvbnNlcyB3aWxsIGJlIG1hcmtlZCBhcyBjb3JyZWN0LCBpbmNvcnJlY3QsIG9yIHVuYW5zd2VyZWQuJyxcbiAgICAgICAgYTExeVNob3dTb2x1dGlvbjogJ1Nob3cgdGhlIHNvbHV0aW9uLiBUaGUgdGFzayB3aWxsIGJlIG1hcmtlZCB3aXRoIGl0cyBjb3JyZWN0IHNvbHV0aW9uLicsXG4gICAgICAgIGExMXlSZXRyeTogJ1JldHJ5IHRoZSB0YXNrLiBSZXNldCBhbGwgcmVzcG9uc2VzIGFuZCBzdGFydCB0aGUgdGFzayBvdmVyIGFnYWluLicsXG4gICAgICB9LFxuICAgICAgYmVoYXZpb3VyOiB7XG4gICAgICAgIGVuYWJsZVJldHJ5OiB0cnVlLFxuICAgICAgICBlbmFibGVTb2x1dGlvbnNCdXR0b246IHRydWUsXG4gICAgICAgIGVuYWJsZUNoZWNrQnV0dG9uOiB0cnVlLFxuICAgICAgICB0eXBlOiAnYXV0bycsXG4gICAgICAgIHNpbmdsZVBvaW50OiB0cnVlLFxuICAgICAgICByYW5kb21BbnN3ZXJzOiBmYWxzZSxcbiAgICAgICAgc2hvd1NvbHV0aW9uc1JlcXVpcmVzSW5wdXQ6IHRydWUsXG4gICAgICAgIGF1dG9DaGVjazogZmFsc2UsXG4gICAgICAgIHBhc3NQZXJjZW50YWdlOiAxMDAsXG4gICAgICAgIHNob3dTY29yZVBvaW50czogdHJ1ZVxuICAgICAgfVxuICAgIH07XG4gICAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHRydWUsIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIGNvbnNvbGUubG9nKFwiTXVsdGljaG9pY2VcIiwgcGFyYW1zKVxuXG4gICAgLy9hcnJheSBvZiBjb250YWluZXJzLiB3aWxsIGJlIHVzZWQgZm9yIHNjYWxpbmcgbGF0ZXJcbiAgICAvLyB0aGlzLnZzZUNvbnRhaW5lciA9IFtdXG4gICAgLy8gdGhpcy52c2VJbnN0YW5jZXMgPSBbXVxuXG4gICAgLy8gS2VlcCB0cmFjayBvZiBudW1iZXIgb2YgY29ycmVjdCBjaG9pY2VzXG4gICAgdmFyIG51bUNvcnJlY3QgPSAwO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGNob2ljZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYW5zd2VyID0gcGFyYW1zLmFuc3dlcnNbaV07XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aXBzIGFuZCBmZWVkYmFjayBleGlzdHNcbiAgICAgIGFuc3dlci50aXBzQW5kRmVlZGJhY2sgPSBhbnN3ZXIudGlwc0FuZEZlZWRiYWNrIHx8IHt9O1xuXG4gICAgICBpZiAocGFyYW1zLmFuc3dlcnNbaV0uY29ycmVjdCkge1xuICAgICAgICAvLyBVcGRhdGUgbnVtYmVyIG9mIGNvcnJlY3QgY2hvaWNlc1xuICAgICAgICBudW1Db3JyZWN0Kys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIG5vIGNob2ljZXMgaXMgdGhlIGNvcnJlY3RcbiAgICB2YXIgYmxhbmtJc0NvcnJlY3QgPSAobnVtQ29ycmVjdCA9PT0gMCk7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGFzayB0eXBlXG4gICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIudHlwZSA9PT0gJ2F1dG8nKSB7XG4gICAgICAvLyBVc2Ugc2luZ2xlIGNob2ljZSBpZiBvbmx5IG9uZSBjaG9pY2UgaXMgY29ycmVjdFxuICAgICAgcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPSAobnVtQ29ycmVjdCA9PT0gMSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPSAocGFyYW1zLmJlaGF2aW91ci50eXBlID09PSAnc2luZ2xlJyk7XG4gICAgfVxuXG4gICAgdmFyIGdldENoZWNrYm94T3JSYWRpb0ljb24gPSBmdW5jdGlvbiAocmFkaW8sIHNlbGVjdGVkKSB7XG4gICAgICB2YXIgaWNvbjtcbiAgICAgIGlmIChyYWRpbykge1xuICAgICAgICBpY29uID0gc2VsZWN0ZWQgPyAnJiN4ZTYwMzsnIDogJyYjeGU2MDA7JztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpY29uID0gc2VsZWN0ZWQgPyAnJiN4ZTYwMTsnIDogJyYjeGU2MDI7JztcbiAgICAgIH1cbiAgICAgIHJldHVybiBpY29uO1xuICAgIH07XG5cbiAgICAvLyBJbml0aWFsaXplIGJ1dHRvbnMgYW5kIGVsZW1lbnRzLlxuICAgIHZhciAkbXlEb207XG4gICAgdmFyICRmZWVkYmFja0RpYWxvZztcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgZmVlZGJhY2sgZGlhbG9nc1xuICAgICAqL1xuICAgIHZhciByZW1vdmVGZWVkYmFja0RpYWxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgb3BlbiBmZWVkYmFjayBkaWFsb2dzLlxuICAgICAgJG15RG9tLnVuYmluZCgnY2xpY2snLCByZW1vdmVGZWVkYmFja0RpYWxvZyk7XG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1mZWVkYmFjay1idXR0b24sIC5oNXAtZmVlZGJhY2stZGlhbG9nJykucmVtb3ZlKCk7XG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1oYXMtZmVlZGJhY2snKS5yZW1vdmVDbGFzcygnaDVwLWhhcy1mZWVkYmFjaycpO1xuICAgICAgaWYgKCRmZWVkYmFja0RpYWxvZykge1xuICAgICAgICAkZmVlZGJhY2tEaWFsb2cucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzY29yZSA9IDA7XG4gICAgdmFyIHNvbHV0aW9uc1Zpc2libGUgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEFkZCBmZWVkYmFjayB0byBlbGVtZW50XG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IEVsZW1lbnQgdGhhdCBmZWVkYmFjayB3aWxsIGJlIGFkZGVkIHRvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZlZWRiYWNrIEZlZWRiYWNrIHN0cmluZ1xuICAgICAqL1xuICAgIHZhciBhZGRGZWVkYmFjayA9IGZ1bmN0aW9uICgkZWxlbWVudCwgZmVlZGJhY2spIHtcbiAgICAgICRmZWVkYmFja0RpYWxvZyA9ICQoJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImg1cC1mZWVkYmFjay1kaWFsb2dcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJoNXAtZmVlZGJhY2staW5uZXJcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJoNXAtZmVlZGJhY2stdGV4dFwiPicgKyBmZWVkYmFjayArICc8L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+Jyk7XG5cbiAgICAgIC8vbWFrZSBzdXJlIGZlZWRiYWNrIGlzIG9ubHkgYWRkZWQgb25jZVxuICAgICAgaWYgKCEkZWxlbWVudC5maW5kKCQoJy5oNXAtZmVlZGJhY2stZGlhbG9nJykpLmxlbmd0aCkge1xuICAgICAgICAkZmVlZGJhY2tEaWFsb2cuYXBwZW5kVG8oJGVsZW1lbnQuYWRkQ2xhc3MoJ2g1cC1oYXMtZmVlZGJhY2snKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRoZSBkaWZmZXJlbnQgcGFydHMgb2YgdGhlIHRhc2sgd2l0aCB0aGUgUXVlc3Rpb24gc3RydWN0dXJlLlxuICAgICAqL1xuICAgIHNlbGYucmVnaXN0ZXJEb21FbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtZWRpYSA9IHBhcmFtcy5tZWRpYTtcbiAgICAgIGlmIChtZWRpYSAmJiBtZWRpYS50eXBlICYmIG1lZGlhLnR5cGUubGlicmFyeSkge1xuICAgICAgICBtZWRpYSA9IG1lZGlhLnR5cGU7XG4gICAgICAgIHZhciB0eXBlID0gbWVkaWEubGlicmFyeS5zcGxpdCgnICcpWzBdO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ0g1UC5JbWFnZScpIHtcbiAgICAgICAgICBpZiAobWVkaWEucGFyYW1zLmZpbGUpIHtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRhc2sgaW1hZ2VcbiAgICAgICAgICAgIHNlbGYuc2V0SW1hZ2UobWVkaWEucGFyYW1zLmZpbGUucGF0aCwge1xuICAgICAgICAgICAgICBkaXNhYmxlSW1hZ2Vab29taW5nOiBwYXJhbXMubWVkaWEuZGlzYWJsZUltYWdlWm9vbWluZyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgYWx0OiBtZWRpYS5wYXJhbXMuYWx0LFxuICAgICAgICAgICAgICB0aXRsZTogbWVkaWEucGFyYW1zLnRpdGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ0g1UC5WaWRlbycpIHtcbiAgICAgICAgICBpZiAobWVkaWEucGFyYW1zLnNvdXJjZXMpIHtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRhc2sgdmlkZW9cbiAgICAgICAgICAgIHNlbGYuc2V0VmlkZW8obWVkaWEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnSDVQLkF1ZGlvJykge1xuICAgICAgICAgIGlmIChtZWRpYS5wYXJhbXMuZmlsZXMpIHtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRhc2sgYXVkaW9cbiAgICAgICAgICAgIHNlbGYuc2V0QXVkaW8obWVkaWEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgd2UncmUgdXNpbmcgY2hlY2tib3hlcyBvciByYWRpbyBidXR0b25zXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcmFtcy5hbnN3ZXJzW2ldLmNoZWNrYm94T3JSYWRpb0ljb24gPSBnZXRDaGVja2JveE9yUmFkaW9JY29uKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyLCBwYXJhbXMudXNlckFuc3dlcnMuaW5kZXhPZihpKSA+IC0xKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVnaXN0ZXIgSW50cm9kdWN0aW9uXG4gICAgICBzZWxmLnNldEludHJvZHVjdGlvbignPGRpdiBpZD1cIicgKyBwYXJhbXMubGFiZWxJZCArICdcIj4nICsgcGFyYW1zLnF1ZXN0aW9uICsgJzwvZGl2PicpO1xuXG4gICAgICAvLyBSZWdpc3RlciB0YXNrIGNvbnRlbnQgYXJlYVxuICAgICAgJG15RG9tID0gJCgnPHVsPicsIHtcbiAgICAgICAgJ2NsYXNzJzogJ2g1cC1hbnN3ZXJzJyxcbiAgICAgICAgcm9sZTogcGFyYW1zLnJvbGUsXG4gICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBwYXJhbXMubGFiZWxJZFxuICAgICAgfSk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYW5zd2VyID0gcGFyYW1zLmFuc3dlcnNbaV07XG4gICAgICAgICQoJzxsaT4nLCB7XG4gICAgICAgICAgJ2NsYXNzJzogJ2g1cC1hbnN3ZXInLFxuICAgICAgICAgIHJvbGU6IGFuc3dlci5yb2xlLFxuICAgICAgICAgIHRhYmluZGV4OiBhbnN3ZXIudGFiaW5kZXgsXG4gICAgICAgICAgJ2FyaWEtY2hlY2tlZCc6IGFuc3dlci5jaGVja2VkLFxuICAgICAgICAgICdkYXRhLWlkJzogaSxcbiAgICAgICAgICBodG1sOiAnPGRpdiBjbGFzcz1cImg1cC1hbHRlcm5hdGl2ZS1jb250YWluZXJcIiBhbnN3ZXItaWQ9XCInICsgaS50b1N0cmluZygpICsgJ1wiPjxzcGFuIGNsYXNzPVwiaDVwLWFsdGVybmF0aXZlLWlubmVyXCI+JyArIGFuc3dlci50ZXh0ICsgJzwvc3Bhbj48L2Rpdj4nLFxuICAgICAgICAgIGFwcGVuZFRvOiAkbXlEb21cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuc2V0Q29udGVudCgkbXlEb20sIHtcbiAgICAgICAgJ2NsYXNzJzogcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPyAnaDVwLXJhZGlvJyA6ICdoNXAtY2hlY2snXG4gICAgICB9KTtcblxuICAgICAgLy8gQ3JlYXRlIHRpcHM6XG4gICAgICB2YXIgJGFuc3dlcnMgPSAkKCcuaDVwLWFuc3dlcicsICRteURvbSkuZWFjaChmdW5jdGlvbiAoaSkge1xuXG4gICAgICAgIHZhciB0aXAgPSBwYXJhbXMuYW5zd2Vyc1tpXS50aXBzQW5kRmVlZGJhY2sudGlwO1xuICAgICAgICBpZiAodGlwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm47IC8vIE5vIHRpcFxuICAgICAgICB9XG5cbiAgICAgICAgdGlwID0gdGlwLnRyaW0oKTtcbiAgICAgICAgdmFyIHRpcENvbnRlbnQgPSB0aXBcbiAgICAgICAgICAucmVwbGFjZSgvJm5ic3A7L2csICcnKVxuICAgICAgICAgIC5yZXBsYWNlKC88cD4vZywgJycpXG4gICAgICAgICAgLnJlcGxhY2UoLzxcXC9wPi9nLCAnJylcbiAgICAgICAgICAudHJpbSgpO1xuICAgICAgICBpZiAoIXRpcENvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBFbXB0eSB0aXBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdoNXAtaGFzLXRpcCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRpcFxuICAgICAgICB2YXIgJHdyYXAgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgJ2NsYXNzJzogJ2g1cC1tdWx0aWNob2ljZS10aXB3cmFwJyxcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IHBhcmFtcy5VSS50aXBBdmFpbGFibGUgKyAnLidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyICRtdWx0aWNob2ljZVRpcCA9ICQoJzxkaXY+Jywge1xuICAgICAgICAgICdyb2xlJzogJ2J1dHRvbicsXG4gICAgICAgICAgJ3RhYmluZGV4JzogMCxcbiAgICAgICAgICAndGl0bGUnOiBwYXJhbXMuVUkudGlwc0xhYmVsLFxuICAgICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLnRpcHNMYWJlbCxcbiAgICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAgICAgICdjbGFzcyc6ICdtdWx0aWNob2ljZS10aXAnLFxuICAgICAgICAgIGFwcGVuZFRvOiAkd3JhcFxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdGlwSWNvbkh0bWwgPSAnPHNwYW4gY2xhc3M9XCJqb3ViZWwtaWNvbi10aXAtbm9ybWFsXCI+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaDVwLWljb24tc2hhZG93XCI+PC9zcGFuPicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImg1cC1pY29uLXNwZWVjaC1idWJibGVcIj48L3NwYW4+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaDVwLWljb24taW5mb1wiPjwvc3Bhbj4nICtcbiAgICAgICAgICAnPC9zcGFuPic7XG5cbiAgICAgICAgJG11bHRpY2hvaWNlVGlwLmFwcGVuZCh0aXBJY29uSHRtbCk7XG5cbiAgICAgICAgJG11bHRpY2hvaWNlVGlwLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgJHRpcENvbnRhaW5lciA9ICRtdWx0aWNob2ljZVRpcC5wYXJlbnRzKCcuaDVwLWFuc3dlcicpO1xuICAgICAgICAgIHZhciBvcGVuRmVlZGJhY2sgPSAhJHRpcENvbnRhaW5lci5jaGlsZHJlbignLmg1cC1mZWVkYmFjay1kaWFsb2cnKS5pcygkZmVlZGJhY2tEaWFsb2cpO1xuICAgICAgICAgIHJlbW92ZUZlZWRiYWNrRGlhbG9nKCk7XG5cbiAgICAgICAgICAvLyBEbyBub3Qgb3BlbiBmZWVkYmFjayBpZiBpdCB3YXMgb3BlblxuICAgICAgICAgIGlmIChvcGVuRmVlZGJhY2spIHtcbiAgICAgICAgICAgICRtdWx0aWNob2ljZVRpcC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aXAgZGlhbG9nXG4gICAgICAgICAgICBhZGRGZWVkYmFjaygkdGlwQ29udGFpbmVyLCB0aXApO1xuICAgICAgICAgICAgJGZlZWRiYWNrRGlhbG9nLmFkZENsYXNzKCdoNXAtaGFzLXRpcCcpO1xuXG4gICAgICAgICAgICAvLyBUaXAgZm9yIHJlYWRzcGVha2VyXG4gICAgICAgICAgICBzZWxmLnJlYWQodGlwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkbXVsdGljaG9pY2VUaXAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIHRpcCBkaWFsb2cgb24gZG9tIGNsaWNrXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbXlEb20uY2xpY2socmVtb3ZlRmVlZGJhY2tEaWFsb2cpO1xuICAgICAgICAgIH0sIDEwMCk7XG5cbiAgICAgICAgICAvLyBEbyBub3QgcHJvcGFnYXRlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KS5rZXlkb3duKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKGUud2hpY2ggPT09IDMyKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmNsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuaDVwLWFsdGVybmF0aXZlLWNvbnRhaW5lcicsIHRoaXMpLmFwcGVuZCgkd3JhcCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gU2V0IGV2ZW50IGxpc3RlbmVycy5cbiAgICAgIHZhciB0b2dnbGVDaGVjayA9IGZ1bmN0aW9uICgkYW5zKSB7XG4gICAgICAgIGlmICgkYW5zLmF0dHIoJ2FyaWEtZGlzYWJsZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuYW5zd2VyZWQgPSB0cnVlO1xuICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQoJGFucy5kYXRhKCdpZCcpKTtcbiAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgICAgLy8gU3RvcmUgYW5zd2VyXG4gICAgICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzID0gW251bV07XG5cbiAgICAgICAgICAvLyBDYWxjdWxhdGUgc2NvcmVcbiAgICAgICAgICBzY29yZSA9IChwYXJhbXMuYW5zd2Vyc1tudW1dLmNvcnJlY3QgPyAxIDogMCk7XG5cbiAgICAgICAgICAvLyBEZS1zZWxlY3QgcHJldmlvdXMgYW5zd2VyXG4gICAgICAgICAgJGFuc3dlcnMubm90KCRhbnMpLnJlbW92ZUNsYXNzKCdoNXAtc2VsZWN0ZWQnKS5hdHRyKCd0YWJpbmRleCcsICctMScpLmF0dHIoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuXG4gICAgICAgICAgLy8gU2VsZWN0IG5ldyBhbnN3ZXJcbiAgICAgICAgICAkYW5zLmFkZENsYXNzKCdoNXAtc2VsZWN0ZWQnKS5hdHRyKCd0YWJpbmRleCcsICcwJykuYXR0cignYXJpYS1jaGVja2VkJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoJGFucy5hdHRyKCdhcmlhLWNoZWNrZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBwYXJhbXMudXNlckFuc3dlcnMuaW5kZXhPZihudW0pO1xuICAgICAgICAgICAgaWYgKHBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzLnNwbGljZShwb3MsIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEbyBub3QgYWxsb3cgdW4tY2hlY2tpbmcgd2hlbiByZXRyeSBkaXNhYmxlZCBhbmQgYXV0byBjaGVja1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrICYmICFwYXJhbXMuYmVoYXZpb3VyLmVuYWJsZVJldHJ5KSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGNoZWNrXG4gICAgICAgICAgICAkYW5zLnJlbW92ZUNsYXNzKCdoNXAtc2VsZWN0ZWQnKS5hdHRyKCdhcmlhLWNoZWNrZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMudXNlckFuc3dlcnMucHVzaChudW0pO1xuICAgICAgICAgICAgJGFucy5hZGRDbGFzcygnaDVwLXNlbGVjdGVkJykuYXR0cignYXJpYS1jaGVja2VkJywgJ3RydWUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDYWxjdWxhdGUgc2NvcmVcbiAgICAgICAgICBjYWxjU2NvcmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYudHJpZ2dlclhBUEkoJ2ludGVyYWN0ZWQnKTtcbiAgICAgICAgaGlkZVNvbHV0aW9uKCRhbnMpO1xuXG4gICAgICAgIGlmIChwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgc2VsZi5zaG93QnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcbiAgICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgICAgIHNlbGYuaGlkZUJ1dHRvbignc2hvdy1zb2x1dGlvbicpO1xuXG4gICAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgICAgICAgLy8gT25seSBhIHNpbmdsZSBhbnN3ZXIgYWxsb3dlZFxuICAgICAgICAgICAgICBjaGVja0Fuc3dlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFNob3cgZmVlZGJhY2sgZm9yIHNlbGVjdGVkIGFsdGVybmF0aXZlc1xuICAgICAgICAgICAgICBzZWxmLnNob3dDaGVja1NvbHV0aW9uKHRydWUpO1xuXG4gICAgICAgICAgICAgIC8vIEFsd2F5cyBmaW5pc2ggdGFzayBpZiBpdCB3YXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICBpZiAoc2NvcmUgPT09IHNlbGYuZ2V0TWF4U2NvcmUoKSkge1xuICAgICAgICAgICAgICAgIGNoZWNrQW5zd2VyKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRhbnN3ZXJzLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdG9nZ2xlQ2hlY2soJCh0aGlzKSk7XG4gICAgICB9KS5rZXlkb3duKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7IC8vIFNwYWNlIGJhclxuICAgICAgICAgIC8vIFNlbGVjdCBjdXJyZW50IGl0ZW1cbiAgICAgICAgICB0b2dnbGVDaGVjaygkKHRoaXMpKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzODogICAvLyBVcFxuICAgICAgICAgICAgY2FzZSAzNzogeyAvLyBMZWZ0XG4gICAgICAgICAgICAgIC8vIFRyeSB0byBzZWxlY3QgcHJldmlvdXMgaXRlbVxuICAgICAgICAgICAgICB2YXIgJHByZXYgPSAkKHRoaXMpLnByZXYoKTtcbiAgICAgICAgICAgICAgaWYgKCRwcmV2Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRvZ2dsZUNoZWNrKCRwcmV2LmZvY3VzKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgNDA6ICAgLy8gRG93blxuICAgICAgICAgICAgY2FzZSAzOTogeyAvLyBSaWdodFxuICAgICAgICAgICAgICAvLyBUcnkgdG8gc2VsZWN0IG5leHQgaXRlbVxuICAgICAgICAgICAgICB2YXIgJG5leHQgPSAkKHRoaXMpLm5leHQoKTtcbiAgICAgICAgICAgICAgaWYgKCRuZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRvZ2dsZUNoZWNrKCRuZXh0LmZvY3VzKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgLy8gU3BlY2lhbCBmb2N1cyBoYW5kbGVyIGZvciByYWRpbyBidXR0b25zXG4gICAgICAgICRhbnN3ZXJzLmZvY3VzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoJCh0aGlzKS5hdHRyKCdhcmlhLWRpc2FibGVkJykgIT09ICd0cnVlJykge1xuICAgICAgICAgICAgJGFuc3dlcnMubm90KHRoaXMpLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5ibHVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoISRhbnN3ZXJzLmZpbHRlcignLmg1cC1zZWxlY3RlZCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgJGFuc3dlcnMuZmlyc3QoKS5hZGQoJGFuc3dlcnMubGFzdCgpKS5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkcyBjaGVjayBhbmQgcmV0cnkgYnV0dG9uXG4gICAgICBhZGRCdXR0b25zKCk7XG4gICAgICBpZiAoIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG5cbiAgICAgICAgY2FsY1Njb3JlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGggJiYgcGFyYW1zLmFuc3dlcnNbcGFyYW1zLnVzZXJBbnN3ZXJzWzBdXS5jb3JyZWN0KSB7XG4gICAgICAgICAgc2NvcmUgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNjb3JlID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBIYXMgYW5zd2VyZWQgdGhyb3VnaCBhdXRvLWNoZWNrIGluIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgICAgaWYgKGhhc0NoZWNrZWRBbnN3ZXIgJiYgcGFyYW1zLmJlaGF2aW91ci5hdXRvQ2hlY2spIHtcblxuICAgICAgICAvLyBDaGVjayBhbnN3ZXJzIGlmIGFuc3dlciBoYXMgYmVlbiBnaXZlbiBvciBtYXggc2NvcmUgcmVhY2hlZFxuICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgfHwgc2NvcmUgPT09IHNlbGYuZ2V0TWF4U2NvcmUoKSkge1xuICAgICAgICAgIGNoZWNrQW5zd2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gU2hvdyBmZWVkYmFjayBmb3IgY2hlY2tlZCBjaGVja2JveGVzXG4gICAgICAgICAgc2VsZi5zaG93Q2hlY2tTb2x1dGlvbih0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnNob3dBbGxTb2x1dGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc29sdXRpb25zVmlzaWJsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzb2x1dGlvbnNWaXNpYmxlID0gdHJ1ZTtcblxuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtYW5zd2VyJykuZWFjaChmdW5jdGlvbiAoaSwgZSkge1xuICAgICAgICB2YXIgJGUgPSAkKGUpO1xuICAgICAgICB2YXIgYSA9IHBhcmFtcy5hbnN3ZXJzW2ldO1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSAnaDVwLXNvbHV0aW9uLWljb24tJyArIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciA/ICdyYWRpbycgOiAnY2hlY2tib3gnKTtcblxuICAgICAgICBpZiAoYS5jb3JyZWN0KSB7XG4gICAgICAgICAgJGUuYWRkQ2xhc3MoJ2g1cC1zaG91bGQnKS5hcHBlbmQoJCgnPHNwYW4vPicsIHtcbiAgICAgICAgICAgICdjbGFzcyc6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIGh0bWw6IHBhcmFtcy5VSS5zaG91bGRDaGVjayArICcuJ1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAkZS5hZGRDbGFzcygnaDVwLXNob3VsZC1ub3QnKS5hcHBlbmQoJCgnPHNwYW4vPicsIHtcbiAgICAgICAgICAgICdjbGFzcyc6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIGh0bWw6IHBhcmFtcy5VSS5zaG91bGROb3RDaGVjayArICcuJ1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSkuZmluZCgnLmg1cC1xdWVzdGlvbi1wbHVzLW9uZSwgLmg1cC1xdWVzdGlvbi1taW51cy1vbmUnKS5yZW1vdmUoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIGlucHV0IGlzIGRpc2FibGVkIGluIHNvbHV0aW9uIG1vZGVcbiAgICAgIGRpc2FibGVJbnB1dCgpO1xuXG4gICAgICAvLyBNb3ZlIGZvY3VzIGJhY2sgdG8gdGhlIGZpcnN0IGFsdGVybmF0aXZlIHNvIHRoYXQgdGhlIHVzZXIgYmVjb21lc1xuICAgICAgLy8gYXdhcmUgdGhhdCB0aGUgc29sdXRpb24gaXMgYmVpbmcgc2hvd24uXG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXI6Zmlyc3QtY2hpbGQnKS5mb2N1cygpO1xuXG4gICAgICAvL0hpZGUgYnV0dG9ucyBhbmQgcmV0cnkgZGVwZW5kaW5nIG9uIHNldHRpbmdzLlxuICAgICAgc2VsZi5oaWRlQnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcbiAgICAgIHNlbGYuaGlkZUJ1dHRvbignc2hvdy1zb2x1dGlvbicpO1xuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuZW5hYmxlUmV0cnkpIHtcbiAgICAgICAgc2VsZi5zaG93QnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICAgIH1cbiAgICAgIHNlbGYudHJpZ2dlcigncmVzaXplJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgaW4gY29udHJhY3RzLlxuICAgICAqIFNob3dzIHRoZSBzb2x1dGlvbiBmb3IgdGhlIHRhc2sgYW5kIGhpZGVzIGFsbCBidXR0b25zLlxuICAgICAqL1xuICAgIHRoaXMuc2hvd1NvbHV0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlbW92ZUZlZWRiYWNrRGlhbG9nKCk7XG4gICAgICBzZWxmLnNob3dDaGVja1NvbHV0aW9uKCk7XG4gICAgICBzZWxmLnNob3dBbGxTb2x1dGlvbnMoKTtcbiAgICAgIGRpc2FibGVJbnB1dCgpO1xuICAgICAgc2VsZi5oaWRlQnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGlkZSBzb2x1dGlvbiBmb3IgdGhlIGdpdmVuIGFuc3dlcihzKVxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGFuc3dlclxuICAgICAqL1xuICAgIHZhciBoaWRlU29sdXRpb24gPSBmdW5jdGlvbiAoJGFuc3dlcikge1xuICAgICAgJGFuc3dlclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1jb3JyZWN0JylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtd3JvbmcnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1zaG91bGQnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1zaG91bGQtbm90JylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtaGFzLWZlZWRiYWNrJylcbiAgICAgICAgLmZpbmQoJy5oNXAtcXVlc3Rpb24tcGx1cy1vbmUsICcgK1xuICAgICAgICAgICcuaDVwLXF1ZXN0aW9uLW1pbnVzLW9uZSwgJyArXG4gICAgICAgICAgJy5oNXAtYW5zd2VyLWljb24sICcgK1xuICAgICAgICAgICcuaDVwLXNvbHV0aW9uLWljb24tcmFkaW8sICcgK1xuICAgICAgICAgICcuaDVwLXNvbHV0aW9uLWljb24tY2hlY2tib3gsICcgK1xuICAgICAgICAgICcuaDVwLWZlZWRiYWNrLWRpYWxvZycpXG4gICAgICAgIC5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKi9cbiAgICB0aGlzLmhpZGVTb2x1dGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzb2x1dGlvbnNWaXNpYmxlID0gZmFsc2U7XG5cbiAgICAgIGhpZGVTb2x1dGlvbigkKCcuaDVwLWFuc3dlcicsICRteURvbSkpO1xuXG4gICAgICB0aGlzLnJlbW92ZUZlZWRiYWNrKCk7IC8vIFJlc2V0IGZlZWRiYWNrXG5cbiAgICAgIHNlbGYudHJpZ2dlcigncmVzaXplJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgd2hvbGUgdGFzay5cbiAgICAgKiBVc2VkIGluIGNvbnRyYWN0cyB3aXRoIGludGVncmF0ZWQgY29udGVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucmVzZXRUYXNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5hbnN3ZXJlZCA9IGZhbHNlO1xuICAgICAgc2VsZi5oaWRlU29sdXRpb25zKCk7XG4gICAgICBwYXJhbXMudXNlckFuc3dlcnMgPSBbXTtcbiAgICAgIHJlbW92ZVNlbGVjdGlvbnMoKTtcbiAgICAgIHNlbGYuc2hvd0J1dHRvbignY2hlY2stYW5zd2VyJyk7XG4gICAgICBzZWxmLmhpZGVCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgc2VsZi5oaWRlQnV0dG9uKCdzaG93LXNvbHV0aW9uJyk7XG4gICAgICBlbmFibGVJbnB1dCgpO1xuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtZmVlZGJhY2stYXZhaWxhYmxlJykucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIHZhciBjYWxjdWxhdGVNYXhTY29yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChibGFua0lzQ29ycmVjdCkge1xuICAgICAgICByZXR1cm4gcGFyYW1zLndlaWdodDtcbiAgICAgIH1cbiAgICAgIHZhciBtYXhTY29yZSA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaG9pY2UgPSBwYXJhbXMuYW5zd2Vyc1tpXTtcbiAgICAgICAgaWYgKGNob2ljZS5jb3JyZWN0KSB7XG4gICAgICAgICAgbWF4U2NvcmUgKz0gKGNob2ljZS53ZWlnaHQgIT09IHVuZGVmaW5lZCA/IGNob2ljZS53ZWlnaHQgOiAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1heFNjb3JlO1xuICAgIH07XG5cbiAgICB0aGlzLmdldE1heFNjb3JlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICghcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgJiYgIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlUG9pbnQgPyBjYWxjdWxhdGVNYXhTY29yZSgpIDogcGFyYW1zLndlaWdodCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGFuc3dlclxuICAgICAqL1xuICAgIHZhciBjaGVja0Fuc3dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFVuYmluZCByZW1vdmFsIG9mIGZlZWRiYWNrIGRpYWxvZ3Mgb24gY2xpY2tcbiAgICAgICRteURvbS51bmJpbmQoJ2NsaWNrJywgcmVtb3ZlRmVlZGJhY2tEaWFsb2cpO1xuXG4gICAgICAvLyBSZW1vdmUgYWxsIHRpcCBkaWFsb2dzXG4gICAgICByZW1vdmVGZWVkYmFja0RpYWxvZygpO1xuXG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5lbmFibGVTb2x1dGlvbnNCdXR0b24pIHtcbiAgICAgICAgc2VsZi5zaG93QnV0dG9uKCdzaG93LXNvbHV0aW9uJyk7XG4gICAgICB9XG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5lbmFibGVSZXRyeSkge1xuICAgICAgICBzZWxmLnNob3dCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgfVxuICAgICAgc2VsZi5oaWRlQnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcblxuICAgICAgc2VsZi5zaG93Q2hlY2tTb2x1dGlvbigpO1xuICAgICAgZGlzYWJsZUlucHV0KCk7XG5cbiAgICAgIHZhciB4QVBJRXZlbnQgPSBzZWxmLmNyZWF0ZVhBUElFdmVudFRlbXBsYXRlKCdhbnN3ZXJlZCcpO1xuICAgICAgYWRkUXVlc3Rpb25Ub1hBUEkoeEFQSUV2ZW50KTtcbiAgICAgIGFkZFJlc3BvbnNlVG9YQVBJKHhBUElFdmVudCk7XG4gICAgICBzZWxmLnRyaWdnZXIoeEFQSUV2ZW50KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgdWkgYnV0dG9ucy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHZhciBhZGRCdXR0b25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRjb250ZW50ID0gJCgnW2RhdGEtY29udGVudC1pZD1cIicgKyBzZWxmLmNvbnRlbnRJZCArICdcIl0uaDVwLWNvbnRlbnQnKTtcbiAgICAgIHZhciAkY29udGFpbmVyUGFyZW50cyA9ICRjb250ZW50LnBhcmVudHMoJy5oNXAtY29udGFpbmVyJyk7XG5cbiAgICAgIC8vIHNlbGVjdCBmaW5kIGNvbnRhaW5lciB0byBhdHRhY2ggZGlhbG9ncyB0b1xuICAgICAgdmFyICRjb250YWluZXI7XG4gICAgICBpZiAoJGNvbnRhaW5lclBhcmVudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIC8vIHVzZSBwYXJlbnQgaGlnaGVzdCB1cCBpZiBhbnlcbiAgICAgICAgJGNvbnRhaW5lciA9ICRjb250YWluZXJQYXJlbnRzLmxhc3QoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCRjb250ZW50Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAkY29udGFpbmVyID0gJGNvbnRlbnQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJGNvbnRhaW5lciA9ICQoZG9jdW1lbnQuYm9keSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3cgc29sdXRpb24gYnV0dG9uXG4gICAgICBzZWxmLmFkZEJ1dHRvbignc2hvdy1zb2x1dGlvbicsIHBhcmFtcy5VSS5zaG93U29sdXRpb25CdXR0b24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2hvd1NvbHV0aW9uc1JlcXVpcmVzSW5wdXQgJiYgIXNlbGYuZ2V0QW5zd2VyR2l2ZW4odHJ1ZSkpIHtcbiAgICAgICAgICAvLyBSZXF1aXJlIGFuc3dlciBiZWZvcmUgc29sdXRpb24gY2FuIGJlIHZpZXdlZFxuICAgICAgICAgIHNlbGYudXBkYXRlRmVlZGJhY2tDb250ZW50KHBhcmFtcy5VSS5ub0lucHV0KTtcbiAgICAgICAgICBzZWxmLnJlYWQocGFyYW1zLlVJLm5vSW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNhbGNTY29yZSgpO1xuICAgICAgICAgIHNlbGYuc2hvd0FsbFNvbHV0aW9ucygpO1xuICAgICAgICB9XG5cbiAgICAgIH0sIGZhbHNlLCB7XG4gICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLmExMXlTaG93U29sdXRpb24sXG4gICAgICB9KTtcblxuICAgICAgLy8gQ2hlY2sgYnV0dG9uXG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5lbmFibGVDaGVja0J1dHRvbiAmJiAoIXBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrIHx8ICFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikpIHtcbiAgICAgICAgc2VsZi5hZGRCdXR0b24oJ2NoZWNrLWFuc3dlcicsIHBhcmFtcy5VSS5jaGVja0Fuc3dlckJ1dHRvbixcbiAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmFuc3dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNoZWNrQW5zd2VyKCk7XG4gICAgICAgICAgICAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXI6Zmlyc3QtY2hpbGQnKS5mb2N1cygpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6IHBhcmFtcy5VSS5hMTF5Q2hlY2ssXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb25maXJtYXRpb25EaWFsb2c6IHtcbiAgICAgICAgICAgICAgZW5hYmxlOiBwYXJhbXMuYmVoYXZpb3VyLmNvbmZpcm1DaGVja0RpYWxvZyxcbiAgICAgICAgICAgICAgbDEwbjogcGFyYW1zLmNvbmZpcm1DaGVjayxcbiAgICAgICAgICAgICAgaW5zdGFuY2U6IHNlbGYsXG4gICAgICAgICAgICAgICRwYXJlbnRFbGVtZW50OiAkY29udGFpbmVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGVudERhdGE6IHNlbGYuY29udGVudERhdGEsXG4gICAgICAgICAgICB0ZXh0SWZTdWJtaXR0aW5nOiBwYXJhbXMuVUkuc3VibWl0QW5zd2VyQnV0dG9uLFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gVHJ5IEFnYWluIGJ1dHRvblxuICAgICAgc2VsZi5hZGRCdXR0b24oJ3RyeS1hZ2FpbicsIHBhcmFtcy5VSS50cnlBZ2FpbkJ1dHRvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnJlc2V0VGFzaygpO1xuXG4gICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnJhbmRvbUFuc3dlcnMpIHtcbiAgICAgICAgICAvLyByZXNodWZmbGUgYW5zd2Vyc1xuICAgICAgICAgIHZhciBvbGRJZE1hcCA9IGlkTWFwO1xuICAgICAgICAgIGlkTWFwID0gZ2V0U2h1ZmZsZU1hcCgpO1xuICAgICAgICAgIHZhciBhbnN3ZXJzRGlzcGxheWVkID0gJG15RG9tLmZpbmQoJy5oNXAtYW5zd2VyJyk7XG4gICAgICAgICAgLy8gcmVtZW1iZXIgdGlwc1xuICAgICAgICAgIHZhciB0aXAgPSBbXTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYW5zd2Vyc0Rpc3BsYXllZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGlwW2ldID0gJChhbnN3ZXJzRGlzcGxheWVkW2ldKS5maW5kKCcuaDVwLW11bHRpY2hvaWNlLXRpcHdyYXAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVGhvc2UgdHdvIGxvb3BzIGNhbm5vdCBiZSBtZXJnZWQgb3IgeW91J2xsIHNjcmV3IHVwIHlvdXIgdGlwc1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhbnN3ZXJzRGlzcGxheWVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBtb3ZlIHRpcHMgYW5kIGFuc3dlcnMgb24gZGlzcGxheVxuICAgICAgICAgICAgJChhbnN3ZXJzRGlzcGxheWVkW2ldKS5maW5kKCcuaDVwLWFsdGVybmF0aXZlLWlubmVyJykuaHRtbChwYXJhbXMuYW5zd2Vyc1tpXS50ZXh0KTtcbiAgICAgICAgICAgICQodGlwW2ldKS5kZXRhY2goKS5hcHBlbmRUbygkKGFuc3dlcnNEaXNwbGF5ZWRbaWRNYXAuaW5kZXhPZihvbGRJZE1hcFtpXSldKS5maW5kKCcuaDVwLWFsdGVybmF0aXZlLWNvbnRhaW5lcicpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGZhbHNlLCB7XG4gICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLmExMXlSZXRyeSxcbiAgICAgIH0sIHtcbiAgICAgICAgY29uZmlybWF0aW9uRGlhbG9nOiB7XG4gICAgICAgICAgZW5hYmxlOiBwYXJhbXMuYmVoYXZpb3VyLmNvbmZpcm1SZXRyeURpYWxvZyxcbiAgICAgICAgICBsMTBuOiBwYXJhbXMuY29uZmlybVJldHJ5LFxuICAgICAgICAgIGluc3RhbmNlOiBzZWxmLFxuICAgICAgICAgICRwYXJlbnRFbGVtZW50OiAkY29udGFpbmVyXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmUgd2hpY2ggZmVlZGJhY2sgdGV4dCB0byBkaXNwbGF5XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcmVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4XG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIHZhciBnZXRGZWVkYmFja1RleHQgPSBmdW5jdGlvbiAoc2NvcmUsIG1heCkge1xuICAgICAgdmFyIHJhdGlvID0gKHNjb3JlIC8gbWF4KTtcblxuICAgICAgdmFyIGZlZWRiYWNrID0gUXVlc3Rpb24uZGV0ZXJtaW5lT3ZlcmFsbEZlZWRiYWNrKHBhcmFtcy5vdmVyYWxsRmVlZGJhY2ssIHJhdGlvKTtcblxuICAgICAgcmV0dXJuIGZlZWRiYWNrLnJlcGxhY2UoJ0BzY29yZScsIHNjb3JlKS5yZXBsYWNlKCdAdG90YWwnLCBtYXgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTaG93cyBmZWVkYmFjayBvbiB0aGUgc2VsZWN0ZWQgZmllbGRzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtza2lwRmVlZGJhY2tdIFNraXAgc2hvd2luZyBmZWVkYmFjayBpZiB0cnVlXG4gICAgICovXG4gICAgdGhpcy5zaG93Q2hlY2tTb2x1dGlvbiA9IGZ1bmN0aW9uIChza2lwRmVlZGJhY2spIHtcbiAgICAgIHZhciBzY29yZVBvaW50cztcbiAgICAgIGlmICghKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyIHx8IHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlUG9pbnQgfHwgIXBhcmFtcy5iZWhhdmlvdXIuc2hvd1Njb3JlUG9pbnRzKSkge1xuICAgICAgICBzY29yZVBvaW50cyA9IG5ldyBRdWVzdGlvbi5TY29yZVBvaW50cygpO1xuICAgICAgfVxuXG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXInKS5lYWNoKGZ1bmN0aW9uIChpLCBlKSB7XG4gICAgICAgIHZhciAkZSA9ICQoZSk7XG4gICAgICAgIHZhciBhID0gcGFyYW1zLmFuc3dlcnNbaV07XG4gICAgICAgIHZhciBjaG9zZW4gPSAoJGUuYXR0cignYXJpYS1jaGVja2VkJykgPT09ICd0cnVlJyk7XG4gICAgICAgIGlmIChjaG9zZW4pIHtcbiAgICAgICAgICBpZiAoYS5jb3JyZWN0KSB7XG4gICAgICAgICAgICAvLyBNYXkgYWxyZWFkeSBoYXZlIGJlZW4gYXBwbGllZCBieSBpbnN0YW50IGZlZWRiYWNrXG4gICAgICAgICAgICBpZiAoISRlLmhhc0NsYXNzKCdoNXAtY29ycmVjdCcpKSB7XG4gICAgICAgICAgICAgICRlLmFkZENsYXNzKCdoNXAtY29ycmVjdCcpLmFwcGVuZCgkKCc8c3Bhbi8+Jywge1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdoNXAtYW5zd2VyLWljb24nLFxuICAgICAgICAgICAgICAgIGh0bWw6IHBhcmFtcy5VSS5jb3JyZWN0QW5zd2VyICsgJy4nXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoISRlLmhhc0NsYXNzKCdoNXAtd3JvbmcnKSkge1xuICAgICAgICAgICAgICAkZS5hZGRDbGFzcygnaDVwLXdyb25nJykuYXBwZW5kKCQoJzxzcGFuLz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2g1cC1hbnN3ZXItaWNvbicsXG4gICAgICAgICAgICAgICAgaHRtbDogcGFyYW1zLlVJLndyb25nQW5zd2VyICsgJy4nXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2NvcmVQb2ludHMpIHtcbiAgICAgICAgICAgIHZhciBhbHRlcm5hdGl2ZUNvbnRhaW5lciA9ICRlWzBdLnF1ZXJ5U2VsZWN0b3IoJy5oNXAtYWx0ZXJuYXRpdmUtY29udGFpbmVyJyk7XG5cbiAgICAgICAgICAgIGlmICghcGFyYW1zLmJlaGF2aW91ci5hdXRvQ2hlY2sgfHwgYWx0ZXJuYXRpdmVDb250YWluZXIucXVlcnlTZWxlY3RvcignLmg1cC1xdWVzdGlvbi1wbHVzLW9uZSwgLmg1cC1xdWVzdGlvbi1taW51cy1vbmUnKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChzY29yZVBvaW50cy5nZXRFbGVtZW50KGEuY29ycmVjdCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2tpcEZlZWRiYWNrKSB7XG4gICAgICAgICAgaWYgKGNob3NlbiAmJiBhLnRpcHNBbmRGZWVkYmFjay5jaG9zZW5GZWVkYmFjayAhPT0gdW5kZWZpbmVkICYmIGEudGlwc0FuZEZlZWRiYWNrLmNob3NlbkZlZWRiYWNrICE9PSAnJykge1xuICAgICAgICAgICAgYWRkRmVlZGJhY2soJGUsIGEudGlwc0FuZEZlZWRiYWNrLmNob3NlbkZlZWRiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIWNob3NlbiAmJiBhLnRpcHNBbmRGZWVkYmFjay5ub3RDaG9zZW5GZWVkYmFjayAhPT0gdW5kZWZpbmVkICYmIGEudGlwc0FuZEZlZWRiYWNrLm5vdENob3NlbkZlZWRiYWNrICE9PSAnJykge1xuICAgICAgICAgICAgYWRkRmVlZGJhY2soJGUsIGEudGlwc0FuZEZlZWRiYWNrLm5vdENob3NlbkZlZWRiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgZmVlZGJhY2tcbiAgICAgIHZhciBtYXggPSBzZWxmLmdldE1heFNjb3JlKCk7XG5cbiAgICAgIC8vIERpc2FibGUgdGFzayBpZiBtYXhzY29yZSBpcyBhY2hpZXZlZFxuICAgICAgdmFyIGZ1bGxTY29yZSA9IChzY29yZSA9PT0gbWF4KTtcblxuICAgICAgaWYgKGZ1bGxTY29yZSkge1xuICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ2NoZWNrLWFuc3dlcicpO1xuICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ3Nob3ctc29sdXRpb24nKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2hvdyBmZWVkYmFja1xuICAgICAgaWYgKCFza2lwRmVlZGJhY2spIHtcbiAgICAgICAgdGhpcy5zZXRGZWVkYmFjayhnZXRGZWVkYmFja1RleHQoc2NvcmUsIG1heCksIHNjb3JlLCBtYXgsIHBhcmFtcy5VSS5zY29yZUJhckxhYmVsKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgY2hvb3NpbmcgbmV3IGlucHV0LlxuICAgICAqL1xuICAgIHZhciBkaXNhYmxlSW5wdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuaDVwLWFuc3dlcicsICRteURvbSkuYXR0cih7XG4gICAgICAgICdhcmlhLWRpc2FibGVkJzogJ3RydWUnLFxuICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICB9KS5yZW1vdmVBdHRyKCdyb2xlJylcbiAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtY2hlY2tlZCcpO1xuXG4gICAgICAkKCcuaDVwLWFuc3dlcnMnKS5yZW1vdmVBdHRyKCdyb2xlJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgbmV3IGlucHV0LlxuICAgICAqL1xuICAgIHZhciBlbmFibGVJbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJy5oNXAtYW5zd2VyJywgJG15RG9tKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgJ2FyaWEtZGlzYWJsZWQnOiAnZmFsc2UnLFxuICAgICAgICAgICdyb2xlJzogcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPyAncmFkaW8nIDogJ2NoZWNrYm94JyxcbiAgICAgICAgfSk7XG5cbiAgICAgICQoJy5oNXAtYW5zd2VycycpLmF0dHIoJ3JvbGUnLCBwYXJhbXMucm9sZSk7XG4gICAgfTtcblxuICAgIHZhciBjYWxjU2NvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzY29yZSA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGFuc3dlciBvZiBwYXJhbXMudXNlckFuc3dlcnMpIHtcbiAgICAgICAgY29uc3QgY2hvaWNlID0gcGFyYW1zLmFuc3dlcnNbYW5zd2VyXTtcbiAgICAgICAgY29uc3Qgd2VpZ2h0ID0gKGNob2ljZS53ZWlnaHQgIT09IHVuZGVmaW5lZCA/IGNob2ljZS53ZWlnaHQgOiAxKTtcbiAgICAgICAgaWYgKGNob2ljZS5jb3JyZWN0KSB7XG4gICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNjb3JlIC09IHdlaWdodDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNjb3JlIDwgMCkge1xuICAgICAgICBzY29yZSA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoIXBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGggJiYgYmxhbmtJc0NvcnJlY3QpIHtcbiAgICAgICAgc2NvcmUgPSBwYXJhbXMud2VpZ2h0O1xuICAgICAgfVxuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlUG9pbnQpIHtcbiAgICAgICAgc2NvcmUgPSAoMTAwICogc2NvcmUgLyBjYWxjdWxhdGVNYXhTY29yZSgpKSA+PSBwYXJhbXMuYmVoYXZpb3VyLnBhc3NQZXJjZW50YWdlID8gcGFyYW1zLndlaWdodCA6IDA7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgc2VsZWN0aW9ucyBmcm9tIHRhc2suXG4gICAgICovXG4gICAgdmFyIHJlbW92ZVNlbGVjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJGFuc3dlcnMgPSAkKCcuaDVwLWFuc3dlcicsICRteURvbSlcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtc2VsZWN0ZWQnKVxuICAgICAgICAuYXR0cignYXJpYS1jaGVja2VkJywgJ2ZhbHNlJyk7XG5cbiAgICAgIGlmICghcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgJGFuc3dlcnMuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRhbnN3ZXJzLmZpcnN0KCkuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXQgZm9jdXMgdG8gZmlyc3Qgb3B0aW9uXG4gICAgICAkYW5zd2Vycy5maXJzdCgpLmZvY3VzKCk7XG5cbiAgICAgIGNhbGNTY29yZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgeEFQSSBkYXRhLlxuICAgICAqIENvbnRyYWN0IHVzZWQgYnkgcmVwb3J0IHJlbmRlcmluZyBlbmdpbmUuXG4gICAgICpcbiAgICAgKiBAc2VlIGNvbnRyYWN0IGF0IHtAbGluayBodHRwczovL2g1cC5vcmcvZG9jdW1lbnRhdGlvbi9kZXZlbG9wZXJzL2NvbnRyYWN0cyNndWlkZXMtaGVhZGVyLTZ9XG4gICAgICovXG4gICAgdGhpcy5nZXRYQVBJRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB4QVBJRXZlbnQgPSB0aGlzLmNyZWF0ZVhBUElFdmVudFRlbXBsYXRlKCdhbnN3ZXJlZCcpO1xuICAgICAgYWRkUXVlc3Rpb25Ub1hBUEkoeEFQSUV2ZW50KTtcbiAgICAgIGFkZFJlc3BvbnNlVG9YQVBJKHhBUElFdmVudCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0ZW1lbnQ6IHhBUElFdmVudC5kYXRhLnN0YXRlbWVudFxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIHRoZSBxdWVzdGlvbiBpdHNlbGYgdG8gdGhlIGRlZmluaXRpb24gcGFydCBvZiBhbiB4QVBJRXZlbnRcbiAgICAgKi9cbiAgICB2YXIgYWRkUXVlc3Rpb25Ub1hBUEkgPSBmdW5jdGlvbiAoeEFQSUV2ZW50KSB7XG4gICAgICB2YXIgZGVmaW5pdGlvbiA9IHhBUElFdmVudC5nZXRWZXJpZmllZFN0YXRlbWVudFZhbHVlKFsnb2JqZWN0JywgJ2RlZmluaXRpb24nXSk7XG4gICAgICBkZWZpbml0aW9uLmRlc2NyaXB0aW9uID0ge1xuICAgICAgICAvLyBSZW1vdmUgdGFncywgbXVzdCB3cmFwIGluIGRpdiB0YWcgYmVjYXVzZSBqUXVlcnkgMS45IHdpbGwgY3Jhc2ggaWYgdGhlIHN0cmluZyBpc24ndCB3cmFwcGVkIGluIGEgdGFnLlxuICAgICAgICAnZW4tVVMnOiAkKCc8ZGl2PicgKyBwYXJhbXMucXVlc3Rpb24gKyAnPC9kaXY+JykudGV4dCgpXG4gICAgICB9O1xuICAgICAgZGVmaW5pdGlvbi50eXBlID0gJ2h0dHA6Ly9hZGxuZXQuZ292L2V4cGFwaS9hY3Rpdml0aWVzL2NtaS5pbnRlcmFjdGlvbic7XG4gICAgICBkZWZpbml0aW9uLmludGVyYWN0aW9uVHlwZSA9ICdjaG9pY2UnO1xuICAgICAgZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVybiA9IFtdO1xuICAgICAgZGVmaW5pdGlvbi5jaG9pY2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlZmluaXRpb24uY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICAnaWQnOiBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyICsgJycsXG4gICAgICAgICAgJ2Rlc2NyaXB0aW9uJzoge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHRhZ3MsIG11c3Qgd3JhcCBpbiBkaXYgdGFnIGJlY2F1c2UgalF1ZXJ5IDEuOSB3aWxsIGNyYXNoIGlmIHRoZSBzdHJpbmcgaXNuJ3Qgd3JhcHBlZCBpbiBhIHRhZy5cbiAgICAgICAgICAgICdlbi1VUyc6ICQoJzxkaXY+JyArIHBhcmFtcy5hbnN3ZXJzW2ldLnRleHQgKyAnPC9kaXY+JykudGV4dCgpXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAocGFyYW1zLmFuc3dlcnNbaV0uY29ycmVjdCkge1xuICAgICAgICAgIGlmICghcGFyYW1zLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAgICAgaWYgKGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm5bMF0gKz0gJ1ssXSc7XG4gICAgICAgICAgICAgIC8vIFRoaXMgbG9va3MgaW5zYW5lLCBidXQgaXQncyBob3cgeW91IHNlcGFyYXRlIG11bHRpcGxlIGFuc3dlcnNcbiAgICAgICAgICAgICAgLy8gdGhhdCBtdXN0IGFsbCBiZSBjaG9zZW4gdG8gYWNoaWV2ZSBwZXJmZWN0IHNjb3JlLi4uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVybi5wdXNoKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm5bMF0gKz0gcGFyYW1zLmFuc3dlcnNbaV0ub3JpZ2luYWxPcmRlcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWZpbml0aW9uLmNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuLnB1c2goJycgKyBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIHRoZSByZXNwb25zZSBwYXJ0IHRvIGFuIHhBUEkgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WEFQSUV2ZW50fSB4QVBJRXZlbnRcbiAgICAgKiAgVGhlIHhBUEkgZXZlbnQgd2Ugd2lsbCBhZGQgYSByZXNwb25zZSB0b1xuICAgICAqL1xuICAgIHZhciBhZGRSZXNwb25zZVRvWEFQSSA9IGZ1bmN0aW9uICh4QVBJRXZlbnQpIHtcbiAgICAgIHZhciBtYXhTY29yZSA9IHNlbGYuZ2V0TWF4U2NvcmUoKTtcbiAgICAgIHZhciBzdWNjZXNzID0gKDEwMCAqIHNjb3JlIC8gbWF4U2NvcmUpID49IHBhcmFtcy5iZWhhdmlvdXIucGFzc1BlcmNlbnRhZ2U7XG5cbiAgICAgIHhBUElFdmVudC5zZXRTY29yZWRSZXN1bHQoc2NvcmUsIG1heFNjb3JlLCBzZWxmLCB0cnVlLCBzdWNjZXNzKTtcbiAgICAgIGlmIChwYXJhbXMudXNlckFuc3dlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYWxjU2NvcmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocmVzcG9uc2UgIT09ICcnKSB7XG4gICAgICAgICAgcmVzcG9uc2UgKz0gJ1ssXSc7XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uc2UgKz0gaWRNYXAgPT09IHVuZGVmaW5lZCA/IHBhcmFtcy51c2VyQW5zd2Vyc1tpXSA6IGlkTWFwW3BhcmFtcy51c2VyQW5zd2Vyc1tpXV07XG4gICAgICB9XG4gICAgICB4QVBJRXZlbnQuZGF0YS5zdGF0ZW1lbnQucmVzdWx0LnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG1hcCBwb2ludGluZyBmcm9tIG9yaWdpbmFsIGFuc3dlcnMgdG8gc2h1ZmZsZWQgYW5zd2Vyc1xuICAgICAqXG4gICAgICogQHJldHVybiB7bnVtYmVyW119IG1hcCBwb2ludGluZyBmcm9tIG9yaWdpbmFsIGFuc3dlcnMgdG8gc2h1ZmZsZWQgYW5zd2Vyc1xuICAgICAqL1xuICAgIHZhciBnZXRTaHVmZmxlTWFwID0gZnVuY3Rpb24gKCkge1xuICAgICAgcGFyYW1zLmFuc3dlcnMgPSBzaHVmZmxlQXJyYXkocGFyYW1zLmFuc3dlcnMpO1xuXG4gICAgICAvLyBDcmVhdGUgYSBtYXAgZnJvbSB0aGUgbmV3IGlkIHRvIHRoZSBvbGQgb25lXG4gICAgICB2YXIgaWRNYXAgPSBbXTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZE1hcFtpXSA9IHBhcmFtcy5hbnN3ZXJzW2ldLm9yaWdpbmFsT3JkZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gaWRNYXA7XG4gICAgfTtcblxuICAgIC8vIEluaXRpYWxpemF0aW9uIGNvZGVcbiAgICAvLyBSYW5kb21pemUgb3JkZXIsIGlmIHJlcXVlc3RlZFxuICAgIHZhciBpZE1hcDtcbiAgICAvLyBTdG9yZSBvcmlnaW5hbCBvcmRlciBpbiBhbnN3ZXJzXG4gICAgZm9yIChpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyID0gaTtcbiAgICB9XG4gICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIucmFuZG9tQW5zd2Vycykge1xuICAgICAgaWRNYXAgPSBnZXRTaHVmZmxlTWFwKCk7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgd2l0aCBhbiBlbXB0eSBzZXQgb2YgdXNlciBhbnN3ZXJzLlxuICAgIHBhcmFtcy51c2VyQW5zd2VycyA9IFtdO1xuXG4gICAgLy8gUmVzdG9yZSBwcmV2aW91cyBzdGF0ZVxuICAgIGlmIChjb250ZW50RGF0YSAmJiBjb250ZW50RGF0YS5wcmV2aW91c1N0YXRlICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgLy8gUmVzdG9yZSBhbnN3ZXJzXG4gICAgICBpZiAoY29udGVudERhdGEucHJldmlvdXNTdGF0ZS5hbnN3ZXJzKSB7XG4gICAgICAgIGlmICghaWRNYXApIHtcbiAgICAgICAgICBwYXJhbXMudXNlckFuc3dlcnMgPSBjb250ZW50RGF0YS5wcmV2aW91c1N0YXRlLmFuc3dlcnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gVGhlIGFuc3dlcnMgaGF2ZSBiZWVuIHNodWZmbGVkLCBhbmQgd2UgbXVzdCB1c2UgdGhlIGlkIG1hcHBpbmcuXG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbnRlbnREYXRhLnByZXZpb3VzU3RhdGUuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBpZE1hcC5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICBpZiAoaWRNYXBba10gPT09IGNvbnRlbnREYXRhLnByZXZpb3VzU3RhdGUuYW5zd2Vyc1tpXSkge1xuICAgICAgICAgICAgICAgIHBhcmFtcy51c2VyQW5zd2Vycy5wdXNoKGspO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhbGNTY29yZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYXNDaGVja2VkQW5zd2VyID0gZmFsc2U7XG5cbiAgICAvLyBMb29wIHRocm91Z2ggY2hvaWNlc1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBhbnMgPSBwYXJhbXMuYW5zd2Vyc1tqXTtcblxuICAgICAgaWYgKCFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAvLyBTZXQgcm9sZVxuICAgICAgICBhbnMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgICAgIGFucy50YWJpbmRleCA9ICcwJztcbiAgICAgICAgaWYgKHBhcmFtcy51c2VyQW5zd2Vycy5pbmRleE9mKGopICE9PSAtMSkge1xuICAgICAgICAgIGFucy5jaGVja2VkID0gJ3RydWUnO1xuICAgICAgICAgIGhhc0NoZWNrZWRBbnN3ZXIgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gU2V0IHJvbGVcbiAgICAgICAgYW5zLnJvbGUgPSAncmFkaW8nO1xuXG4gICAgICAgIC8vIERldGVybWluZSB0YWJpbmRleCwgY2hlY2tlZCBhbmQgZXh0cmEgY2xhc3Nlc1xuICAgICAgICBpZiAocGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIE5vIGNvcnJlY3QgYW5zd2Vyc1xuICAgICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgYW5zLnRhYmluZGV4ID0gJzAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwYXJhbXMudXNlckFuc3dlcnMuaW5kZXhPZihqKSAhPT0gLTEpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjb3JyZWN0IGNob2ljZVxuICAgICAgICAgIGFucy50YWJpbmRleCA9ICcwJztcbiAgICAgICAgICBhbnMuY2hlY2tlZCA9ICd0cnVlJztcbiAgICAgICAgICBoYXNDaGVja2VkQW5zd2VyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgZGVmYXVsdFxuICAgICAgaWYgKGFucy50YWJpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFucy50YWJpbmRleCA9ICctMSc7XG4gICAgICB9XG4gICAgICBpZiAoYW5zLmNoZWNrZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhbnMuY2hlY2tlZCA9ICdmYWxzZSc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgTXVsdGlDaG9pY2VTY29yZTRMTVMuY291bnRlciA9IChNdWx0aUNob2ljZVNjb3JlNExNUy5jb3VudGVyID09PSB1bmRlZmluZWQgPyAwIDogTXVsdGlDaG9pY2VTY29yZTRMTVMuY291bnRlciArIDEpO1xuICAgIHBhcmFtcy5yb2xlID0gKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyID8gJ3JhZGlvZ3JvdXAnIDogJ2dyb3VwJyk7XG4gICAgcGFyYW1zLmxhYmVsSWQgPSAnaDVwLW1jcScgKyBNdWx0aUNob2ljZVNjb3JlNExNUy5jb3VudGVyO1xuXG4gICAgLyoqXG4gICAgICogUGFjayB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgaW50ZXJhY3Rpdml0eSBpbnRvIGEgb2JqZWN0IHRoYXQgY2FuIGJlXG4gICAgICogc2VyaWFsaXplZC5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICB0aGlzLmdldEN1cnJlbnRTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHt9O1xuICAgICAgaWYgKCFpZE1hcCkge1xuICAgICAgICBzdGF0ZS5hbnN3ZXJzID0gcGFyYW1zLnVzZXJBbnN3ZXJzO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIFRoZSBhbnN3ZXJzIGhhdmUgYmVlbiBzaHVmZmxlZCBhbmQgbXVzdCBiZSBtYXBwZWQgYmFjayB0byB0aGVpclxuICAgICAgICAvLyBvcmlnaW5hbCBJRC5cbiAgICAgICAgc3RhdGUuYW5zd2VycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHN0YXRlLmFuc3dlcnMucHVzaChpZE1hcFtwYXJhbXMudXNlckFuc3dlcnNbaV1dKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGhhcyBnaXZlbiBhbiBhbnN3ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpZ25vcmVDaGVja10gSWdub3JlIHJldHVybmluZyB0cnVlIGZyb20gcHJlc3NpbmcgXCJjaGVjay1hbnN3ZXJcIiBidXR0b24uXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiBhbnN3ZXIgaXMgZ2l2ZW5cbiAgICAgKi9cbiAgICB0aGlzLmdldEFuc3dlckdpdmVuID0gZnVuY3Rpb24gKGlnbm9yZUNoZWNrKSB7XG4gICAgICB2YXIgYW5zd2VyZWQgPSBpZ25vcmVDaGVjayA/IGZhbHNlIDogdGhpcy5hbnN3ZXJlZDtcbiAgICAgIHJldHVybiBhbnN3ZXJlZCB8fCBwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoID4gMCB8fCBibGFua0lzQ29ycmVjdDtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRTY29yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzY29yZTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBINVAuY3JlYXRlVGl0bGUoKHRoaXMuY29udGVudERhdGEgJiYgdGhpcy5jb250ZW50RGF0YS5tZXRhZGF0YSAmJiB0aGlzLmNvbnRlbnREYXRhLm1ldGFkYXRhLnRpdGxlKSA/IHRoaXMuY29udGVudERhdGEubWV0YWRhdGEudGl0bGUgOiAnTXVsdGlwbGUgQ2hvaWNlJyk7XG4gICAgfTtcblxuICAgICQoc2VsZi5sb2FkT2JzZXJ2ZXJzKHBhcmFtcykpXG5cbiAgfTtcblxuICBNdWx0aUNob2ljZVNjb3JlNExNUy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFF1ZXN0aW9uLnByb3RvdHlwZSk7XG4gIE11bHRpQ2hvaWNlU2NvcmU0TE1TLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE11bHRpQ2hvaWNlU2NvcmU0TE1TO1xuXG4gIGZ1bmN0aW9uIHNhbml0aXplWE1MU3RyaW5nKHhtbCkge1xuICAgIHJldHVybiB4bWwucmVwbGFjZSgvJmFtcDsvZywgXCImXCIpLnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLyZsdDsvZywgXCI8XCIpLnJlcGxhY2UoLyZxdW90Oy9nLCBcIlxcXCJcIik7XG4gIH1cblxuICAvKipcbiAgKiBOb3RhdGlvbiBsb2dpY1xuICAqL1xuXG4gIC8qKlxuICAqIExvYWQgb2Jlc2VydmVycyBmb3IgY2hhbmdlcyBpbiB0aGUgZG9tLCBzbyB0aGF0IHBhcmFtZXRlcnMgb2YgdGhlIHZzZSBjYW4gYmUgdXBkYXRlZCBcbiAgKi9cbiAgTXVsdGlDaG9pY2VTY29yZTRMTVMucHJvdG90eXBlLmxvYWRPYnNlcnZlcnMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdGhpcy5pbnN0YW5jZVBhc3NlZCA9IGZhbHNlXG4gICAgLy8gZG8gYWxsIHRoZSBpbXBvcnRhbnQgdnNlIHN0dWZmLCB3aGVuIHZzZSBpcyBwcm9wZXJseSBsb2FkZWQgYW5kIGF0dGFjaGVkXG4gICAgdmFyIGRvbUF0dGFjaE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG11dGF0aW9uKSB7XG4gICAgICAgIEFycmF5LmZyb20obXV0YXRpb24uYWRkZWROb2RlcykuZm9yRWFjaChhbiA9PiB7XG4gICAgICAgICAgaWYgKGFuLmNvbnN0cnVjdG9yLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcImVsZW1lbnRcIikpIHtcbiAgICAgICAgICAgIGlmIChhbi5jbGFzc0xpc3QuY29udGFpbnMoXCJoNXAtcXVlc3Rpb24tY29udGVudFwiKSAmJiBhbi5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImg1cC1tdWx0aWNob2ljZVwiKSkge1xuICAgICAgICAgICAgICBpZiAoYW4ucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmg1cC12c2UtY29udGFpbmVyXCIpID09PSBudWxsICYmICF0aGF0Lmluc3RhbmNlUGFzc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5pbnN0YW5jZVBhc3NlZCA9IHRydWVcbiAgICAgICAgICAgICAgICB2YXIgdnNlQ29udGFpbmVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICAgICAgICAgIHZzZUNvbnRhaW5lckRpdi5jbGFzc0xpc3QuYWRkKFwiaDVwLXZzZS1jb250YWluZXJcIilcbiAgICAgICAgICAgICAgICBhbi5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh2c2VDb250YWluZXJEaXYsIGFuKVxuICAgICAgICAgICAgICAgIHRoYXQubG9hZFNWRyhwYXJhbXMpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmKGFuLmNsYXNzTGlzdC5jb250YWlucyhcIm5vdGF0aW9uXCIpKXtcbiAgICAgICAgICAgICAgdGhhdC5hZGp1c3RGcmFtZShhbilcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkb21BdHRhY2hPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LCB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIExvYWRzIFNWRyBmcm9tIHBhcmFtZXRlcnNcbiAgICogcGFyYW1zIG11c3QgY29udGFpbjpcbiAgICogLSBwYXJhbXMucXVlc3Rpb25fbm90YXRpb25fbGlzdFxuICAgKiAtIHBhcmFtcy5hbnN3ZXJzW2ldLmFuc3dlcl9ub3RhdGlvblxuICAgKiBAcGFyYW0geyp9IHBhcmFtcyBcbiAgICovXG4gIE11bHRpQ2hvaWNlU2NvcmU0TE1TLnByb3RvdHlwZS5sb2FkU1ZHID0gYXN5bmMgZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgdmFyIHJvb3RDb250YWluZXJcbiAgICBpZiAocGFyYW1zLnF1ZXN0aW9uX2luc3RhbmNlX251bSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHJvb3RDb250YWluZXIgPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5xdWVzdGlvbi1jb250YWluZXJcIilbcGFyYW1zLnF1ZXN0aW9uX2luc3RhbmNlX251bV1cbiAgICAgIGlmIChyb290Q29udGFpbmVyLmdldEF0dHJpYnV0ZShcImluc3RhbmNlLWlkXCIpID09PSBudWxsKSB7XG4gICAgICAgIHJvb3RDb250YWluZXIuc2V0QXR0cmlidXRlKFwiaW5zdGFuY2UtaWRcIiwgcGFyYW1zLnF1ZXN0aW9uX2luc3RhbmNlX251bSlcbiAgICAgICAgLy8gdGhhdC5hY3RpdmVRdWVzdGlvbkNvbnRhaW5lck9ic2VydmVyLm9ic2VydmUocm9vdENvbnRhaW5lciwge1xuICAgICAgICAvLyAgIGF0dHJpYnV0ZXM6IHRydWVcbiAgICAgICAgLy8gfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vaWYocm9vdENvbnRhaW5lci5nZXRBdHRyaWJ1dGUoXCJpbnN0YW5jZS1pZFwiKSA9PSBwYXJhbXMucXVlc3Rpb25faW5zdGFuY2VfbnVtKSByZXR1cm5cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcm9vdENvbnRhaW5lciA9IHdpbmRvdy5kb2N1bWVudC5ib2R5XG4gICAgfVxuXG4gICAgdmFyIHF1ZXN0aW9uX2NvbnRhaW5lciA9IHJvb3RDb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5oNXAtdnNlLWNvbnRhaW5lclwiKVxuICAgIC8vdGhpcyB3aWxsIHByZXZlbnQgbG9hZGluZyBub24gdmlzaWJsZSBjb250YWluZXJzIChlLmcuIGluIHF1ZXN0aW9uIHNldCwgdnNlLWNvbnRhaW5lcnMgd2lsbCBhcHBlYXIgb24gZGlmZmVyZW50IHNsaWRlcylcbiAgICAvLyBpZiAocm9vdENvbnRhaW5lci5jbG9zZXN0KFwiLnF1ZXN0aW9uLWNvbnRhaW5lcltzdHlsZT0nZGlzcGxheTogbm9uZTsnXCIpICE9PSBudWxsKSByZXR1cm5cbiAgICAvLyBpZiAocm9vdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnZzZS1jb250YWluZXJcIikgIT09IG51bGwpIHJldHVyblxuICAgIGlmIChwYXJhbXMucXVlc3Rpb25fbm90YXRpb25fbGlzdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLnF1ZXN0aW9uX25vdGF0aW9uX2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyICR2c2VRdWVzdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgJHZzZVF1ZXN0aW9uLnNldEF0dHJpYnV0ZShcImlkXCIsICd2c2VDaG9pY2UnICsgdGhpcy5nZW5lcmF0ZVVJRCgpKVxuICAgICAgICAkdnNlUXVlc3Rpb24uY2xhc3NMaXN0LmFkZChcIm5vdGF0aW9uXCIpXG4gICAgICAgIHZhciBzdmdvdXQgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHNhbml0aXplWE1MU3RyaW5nKHBhcmFtcy5xdWVzdGlvbl9ub3RhdGlvbl9saXN0W2ldLm5vdGF0aW9uV2lkZ2V0KSwgXCJ0ZXh0L2h0bWxcIikuYm9keS5maXJzdENoaWxkXG4gICAgICAgIHN2Z291dC5xdWVyeVNlbGVjdG9yQWxsKFwiI21hbmlwdWxhdG9yQ2FudmFzLCAjc2NvcmVSZWN0cywgI2xhYmVsQ2FudmFzLCAjcGhhbnRvbUNhbnZhc1wiKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmUoKSlcbiAgICAgICAgc3Znb3V0LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWFya2VkLCAubGFzdEFkZGVkXCIpLmZvckVhY2gobSA9PiB7XG4gICAgICAgICAgbS5jbGFzc0xpc3QucmVtb3ZlKFwibWFya2VkXCIpXG4gICAgICAgICAgbS5jbGFzc0xpc3QucmVtb3ZlKFwibGFzdEFkZGVkXCIpXG4gICAgICAgIH0pXG4gICAgICAgIC8vc3Znb3V0LnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdmdcIikuZm9yRWFjaChzdmcgPT4gc3ZnLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGUoMi41KVwiKVxuICAgICAgICAkdnNlUXVlc3Rpb24uYXBwZW5kKHN2Z291dClcbiAgICAgICAgcXVlc3Rpb25fY29udGFpbmVyLmFwcGVuZENoaWxkKCR2c2VRdWVzdGlvbilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocGFyYW1zLmFuc3dlcnNbaV0uYW5zd2VyX25vdGF0aW9uICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eU1FSShwYXJhbXMuYW5zd2Vyc1tpXS5hbnN3ZXJfbm90YXRpb24ubm90YXRpb25XaWRnZXQpKSB7XG4gICAgICAgICAgdmFyIHV1aWQgPSB0aGlzLmdlbmVyYXRlVUlEKClcbiAgICAgICAgICB2YXIgJHZzZUFuc3dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgICAkdnNlQW5zd2VyLnNldEF0dHJpYnV0ZShcImlkXCIsICd2c2VBbnN3ZXInICsgdXVpZClcbiAgICAgICAgICAkdnNlQW5zd2VyLmNsYXNzTGlzdC5hZGQoXCJub3RhdGlvblwiKVxuICAgICAgICAgIHZhciBhbnN3ZXJDb250YWluZXIgPSByb290Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuaDVwLWFsdGVybmF0aXZlLWNvbnRhaW5lclthbnN3ZXItaWQ9J1wiICsgaS50b1N0cmluZygpICsgXCInXCIpXG4gICAgICAgICAgdmFyIHN2Z291dCA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoc2FuaXRpemVYTUxTdHJpbmcocGFyYW1zLmFuc3dlcnNbaV0uYW5zd2VyX25vdGF0aW9uLm5vdGF0aW9uV2lkZ2V0KSwgXCJ0ZXh0L2h0bWxcIikuYm9keS5maXJzdENoaWxkXG4gICAgICAgICAgc3Znb3V0LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjbWFuaXB1bGF0b3JDYW52YXMsICNzY29yZVJlY3RzLCAjbGFiZWxDYW52YXMsICNwaGFudG9tQ2FudmFzXCIpLmZvckVhY2goYyA9PiBjLnJlbW92ZSgpKVxuICAgICAgICAgIHN2Z291dC5xdWVyeVNlbGVjdG9yQWxsKFwiLm1hcmtlZCwgLmxhc3RBZGRlZFwiKS5mb3JFYWNoKG0gPT4ge1xuICAgICAgICAgICAgbS5jbGFzc0xpc3QucmVtb3ZlKFwibWFya2VkXCIpXG4gICAgICAgICAgICBtLmNsYXNzTGlzdC5yZW1vdmUoXCJsYXN0QWRkZWRcIilcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vc3Znb3V0LnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdmdcIikuZm9yRWFjaChzdmcgPT4gc3ZnLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGUoMi41KVwiKVxuICAgICAgICAgICR2c2VBbnN3ZXIuYXBwZW5kKHN2Z291dClcbiAgICAgICAgICBhbnN3ZXJDb250YWluZXIuYXBwZW5kQ2hpbGQoJHZzZUFuc3dlcilcblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudnNlSW5zdGFuY2VzXG4gIH1cblxuICAvKipcbiAgICAgKiBBZGp1c3Qgc2l6ZXMgYWNjb3JkaW5nIHRvIGRlZmluaXRpb24tc2NhbGUgaGVpZ2h0IG9mIGNvbnRlbnRzIHdoZW4gYWxsIG5lY2Vzc2FyeSBjb250YWluZXJzIGFyZSBsb2FkZWQuXG4gICAgICovXG4gIE11bHRpQ2hvaWNlU2NvcmU0TE1TLnByb3RvdHlwZS5hZGp1c3RGcmFtZSA9IGZ1bmN0aW9uICh2c2VDb250YWluZXIpIHtcblxuICAgIHZhciBjb250YWluZXJTVkcgPSB2c2VDb250YWluZXIucXVlcnlTZWxlY3RvcihcIiN2cnZTVkdcIikgLy8oXCIjcm9vdFNWRyAuZGVmaW5pdGlvbi1zY2FsZVwiKVxuICAgIHZhciBjb250YWluZXJIZWlnaHRcbiAgICBpZiAoY29udGFpbmVyU1ZHICE9PSBudWxsKSB7XG4gICAgICBjb250YWluZXJIZWlnaHQgPSBjb250YWluZXJTVkcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0ICogMS4xXG4gICAgICBjb250YWluZXJIZWlnaHQgPSBjb250YWluZXJIZWlnaHQudG9TdHJpbmcoKSArIFwicHhcIlxuICAgIH1cbiAgICB2c2VDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0IHx8IFwiMjByZW1cIlxuICAgIFxuICAgIC8vIHZhciBoNXBDb250YWluZXIgPSB2c2VDb250YWluZXIucGFyZW50RWxlbWVudCAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaDVwLXZzZS1jb250YWluZXJcIilcbiAgICAvLyB2YXIgc2hvd0NoaWxkcmVuID0gaDVwQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudnNlLWNvbnRhaW5lclwiKVxuICAgIC8vIHZhciBoNXBDb250YWluZXJIZWlnaHQgPSBwYXJzZUZsb2F0KGg1cENvbnRhaW5lci5zdHlsZS5oZWlndGgpIHx8IDBcbiAgICAvLyBzaG93Q2hpbGRyZW4uZm9yRWFjaChzYyA9PiB7XG4gICAgLy8gICBoNXBDb250YWluZXJIZWlnaHQgKz0gc2MuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0XG4gICAgLy8gICBzYy5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIiAvLyB2ZXJ5IGltcG9ydGFudCwgc28gdGhhdCB0aGUgY29udGFpbmVycyBhcmUgZGlzcGxheWVkIGluIHRoZSBzYW1lIGNvbHVtblxuICAgIC8vIH0pXG4gICAgLy8gaDVwQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGg1cENvbnRhaW5lckhlaWdodC50b1N0cmluZygpICsgXCJweFwiXG4gICAgLy8gd2luZG93LmZyYW1lRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAocGFyc2VGbG9hdCh3aW5kb3cuZnJhbWVFbGVtZW50LnN0eWxlLmhlaWdodCkgKyBoNXBDb250YWluZXJIZWlnaHQgLyAxKS50b1N0cmluZygpICsgXCJweFwiXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgZ2l2ZW4gTUVJIGlzIGp1c3QgZW1wdHkuXG4gICAqIEVtcHR5IG1lYW5zOiBPbmx5IG9uZSBsYXllciB3aXRoIG9uZSBtUmVzdC4gVGhpcyBpcyB0aGUgZGVmYXVsdCBub3RhdGlvbiBzZXR1cCB3aXRob3V0IGNoYW5naW5nIGFueXRoaW5nLlxuICAgKiBAcGFyYW0geyp9IG1laSBcbiAgICogQHJldHVybnMgXG4gICAqL1xuICBNdWx0aUNob2ljZVNjb3JlNExNUy5wcm90b3R5cGUuaXNFbXB0eU1FSSA9IGZ1bmN0aW9uIChtZWkpIHtcbiAgICAvL2NvbnZlcnQgc3RyaW5nIGZvciBwcm9wZXIgcGFyc2luZ1xuICAgIG1laSA9IG1laS5yZXBsYWNlKC9cXG4vZywgXCJcIik7IC8vIGRlbGV0ZSBhbGwgdW5uZWNlc3NhcnkgbmV3bGluZVxuICAgIG1laSA9IG1laS5yZXBsYWNlKC9cXHN7Mix9L2csIFwiXCIpOyAvLyBkZWxldGUgYWxsIHVubmVjZXNzYXJ5IHdoaXRlc3BhY2VzXG4gICAgbWVpID0gbWVpLnJlcGxhY2UoLyZhbXA7L2csIFwiJlwiKS5yZXBsYWNlKC8mZ3Q7L2csIFwiPlwiKS5yZXBsYWNlKC8mbHQ7L2csIFwiPFwiKS5yZXBsYWNlKC8mcXVvdDsvZywgXCJcXFwiXCIpO1xuXG4gICAgdmFyIHBhcnNlciA9IG5ldyBET01QYXJzZXIoKVxuICAgIHZhciB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKG1laSwgXCJ0ZXh0L3htbFwiKVxuICAgIHJldHVybiB4bWxEb2MucXVlcnlTZWxlY3RvckFsbChcImxheWVyXCIpLmxlbmd0aCA9PT0gMSAmJiB4bWxEb2MucXVlcnlTZWxlY3RvcihcImxheWVyIG1SZXN0XCIpICE9PSBudWxsXG4gIH1cblxuICBNdWx0aUNob2ljZVNjb3JlNExNUy5wcm90b3R5cGUuZ2VuZXJhdGVVSUQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpcnN0UGFydCA9ICgoTWF0aC5yYW5kb20oKSAqIDQ2NjU2KSB8IDApLnRvU3RyaW5nKDM2KVxuICAgIHZhciBzZWNvbmRQYXJ0ID0gKChNYXRoLnJhbmRvbSgpICogNDY2NTYpIHwgMCkudG9TdHJpbmcoMzYpXG4gICAgZmlyc3RQYXJ0ID0gKFwiMDAwXCIgKyBmaXJzdFBhcnQpLnNsaWNlKC0zKTtcbiAgICBzZWNvbmRQYXJ0ID0gKFwiMDAwXCIgKyBzZWNvbmRQYXJ0KS5zbGljZSgtMyk7XG4gICAgcmV0dXJuIGZpcnN0UGFydCArIHNlY29uZFBhcnQ7XG4gIH1cblxuICByZXR1cm4gTXVsdGlDaG9pY2VTY29yZTRMTVNcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IE1DUzRMIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgXCIuLi9jc3MvbXVsdGljaG9pY2UuY3NzXCJcbmltcG9ydCBNQ1M0TCBmcm9tIFwiLi4vanMvbXVsdGljaG9pY2UuanNcIlxuXG4vLyBMb2FkIGxpYnJhcnlcbkg1UCA9IEg1UCB8fCB7fTtcbkg1UC5NdWx0aUNob2ljZVNjb3JlNExNUyA9IE1DUzRMO1xuIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkg1UCIsImpRdWVyeSIsIkpvdWJlbFVJIiwiUXVlc3Rpb24iLCJzaHVmZmxlQXJyYXkiLCIkIiwiVUkiLCJNQ1M0TCIsIk11bHRpQ2hvaWNlU2NvcmU0TE1TIiwib3B0aW9ucyIsImNvbnRlbnRJZCIsImNvbnRlbnREYXRhIiwic2VsZiIsImNhbGwiLCJkZWZhdWx0cyIsImltYWdlIiwicXVlc3Rpb24iLCJhbnN3ZXJzIiwidGlwc0FuZEZlZWRiYWNrIiwidGlwIiwiY2hvc2VuRmVlZGJhY2siLCJub3RDaG9zZW5GZWVkYmFjayIsInRleHQiLCJjb3JyZWN0Iiwib3ZlcmFsbEZlZWRiYWNrIiwid2VpZ2h0IiwidXNlckFuc3dlcnMiLCJjaGVja0Fuc3dlckJ1dHRvbiIsInN1Ym1pdEFuc3dlckJ1dHRvbiIsInNob3dTb2x1dGlvbkJ1dHRvbiIsInRyeUFnYWluQnV0dG9uIiwic2NvcmVCYXJMYWJlbCIsInRpcEF2YWlsYWJsZSIsImZlZWRiYWNrQXZhaWxhYmxlIiwicmVhZEZlZWRiYWNrIiwic2hvdWxkQ2hlY2siLCJzaG91bGROb3RDaGVjayIsIm5vSW5wdXQiLCJhMTF5Q2hlY2siLCJhMTF5U2hvd1NvbHV0aW9uIiwiYTExeVJldHJ5IiwiYmVoYXZpb3VyIiwiZW5hYmxlUmV0cnkiLCJlbmFibGVTb2x1dGlvbnNCdXR0b24iLCJlbmFibGVDaGVja0J1dHRvbiIsInR5cGUiLCJzaW5nbGVQb2ludCIsInJhbmRvbUFuc3dlcnMiLCJzaG93U29sdXRpb25zUmVxdWlyZXNJbnB1dCIsImF1dG9DaGVjayIsInBhc3NQZXJjZW50YWdlIiwic2hvd1Njb3JlUG9pbnRzIiwicGFyYW1zIiwiZXh0ZW5kIiwiY29uc29sZSIsImxvZyIsIm51bUNvcnJlY3QiLCJpIiwibGVuZ3RoIiwiYW5zd2VyIiwiYmxhbmtJc0NvcnJlY3QiLCJzaW5nbGVBbnN3ZXIiLCJnZXRDaGVja2JveE9yUmFkaW9JY29uIiwicmFkaW8iLCJzZWxlY3RlZCIsImljb24iLCIkbXlEb20iLCIkZmVlZGJhY2tEaWFsb2ciLCJyZW1vdmVGZWVkYmFja0RpYWxvZyIsInVuYmluZCIsImZpbmQiLCJyZW1vdmUiLCJyZW1vdmVDbGFzcyIsInNjb3JlIiwic29sdXRpb25zVmlzaWJsZSIsImFkZEZlZWRiYWNrIiwiJGVsZW1lbnQiLCJmZWVkYmFjayIsImFwcGVuZFRvIiwiYWRkQ2xhc3MiLCJyZWdpc3RlckRvbUVsZW1lbnRzIiwibWVkaWEiLCJsaWJyYXJ5Iiwic3BsaXQiLCJmaWxlIiwic2V0SW1hZ2UiLCJwYXRoIiwiZGlzYWJsZUltYWdlWm9vbWluZyIsImFsdCIsInRpdGxlIiwic291cmNlcyIsInNldFZpZGVvIiwiZmlsZXMiLCJzZXRBdWRpbyIsImNoZWNrYm94T3JSYWRpb0ljb24iLCJpbmRleE9mIiwic2V0SW50cm9kdWN0aW9uIiwibGFiZWxJZCIsInJvbGUiLCJ0YWJpbmRleCIsImNoZWNrZWQiLCJodG1sIiwidG9TdHJpbmciLCJzZXRDb250ZW50IiwiJGFuc3dlcnMiLCJlYWNoIiwidW5kZWZpbmVkIiwidHJpbSIsInRpcENvbnRlbnQiLCJyZXBsYWNlIiwiJHdyYXAiLCIkbXVsdGljaG9pY2VUaXAiLCJ0aXBzTGFiZWwiLCJ0aXBJY29uSHRtbCIsImFwcGVuZCIsImNsaWNrIiwiJHRpcENvbnRhaW5lciIsInBhcmVudHMiLCJvcGVuRmVlZGJhY2siLCJjaGlsZHJlbiIsImlzIiwiYXR0ciIsInJlYWQiLCJ0cmlnZ2VyIiwic2V0VGltZW91dCIsImtleWRvd24iLCJlIiwid2hpY2giLCJ0b2dnbGVDaGVjayIsIiRhbnMiLCJhbnN3ZXJlZCIsIm51bSIsInBhcnNlSW50IiwiZGF0YSIsIm5vdCIsInBvcyIsInNwbGljZSIsInB1c2giLCJjYWxjU2NvcmUiLCJ0cmlnZ2VyWEFQSSIsImhpZGVTb2x1dGlvbiIsInNob3dCdXR0b24iLCJoaWRlQnV0dG9uIiwiY2hlY2tBbnN3ZXIiLCJzaG93Q2hlY2tTb2x1dGlvbiIsImdldE1heFNjb3JlIiwia2V5Q29kZSIsIiRwcmV2IiwicHJldiIsImZvY3VzIiwiJG5leHQiLCJuZXh0IiwiYmx1ciIsImZpbHRlciIsImZpcnN0IiwiYWRkIiwibGFzdCIsImFkZEJ1dHRvbnMiLCJoYXNDaGVja2VkQW5zd2VyIiwic2hvd0FsbFNvbHV0aW9ucyIsIiRlIiwiYSIsImNsYXNzTmFtZSIsImRpc2FibGVJbnB1dCIsInNob3dTb2x1dGlvbnMiLCIkYW5zd2VyIiwiaGlkZVNvbHV0aW9ucyIsInJlbW92ZUZlZWRiYWNrIiwicmVzZXRUYXNrIiwicmVtb3ZlU2VsZWN0aW9ucyIsImVuYWJsZUlucHV0IiwiY2FsY3VsYXRlTWF4U2NvcmUiLCJtYXhTY29yZSIsImNob2ljZSIsInhBUElFdmVudCIsImNyZWF0ZVhBUElFdmVudFRlbXBsYXRlIiwiYWRkUXVlc3Rpb25Ub1hBUEkiLCJhZGRSZXNwb25zZVRvWEFQSSIsIiRjb250ZW50IiwiJGNvbnRhaW5lclBhcmVudHMiLCIkY29udGFpbmVyIiwiZG9jdW1lbnQiLCJib2R5IiwiYWRkQnV0dG9uIiwiZ2V0QW5zd2VyR2l2ZW4iLCJ1cGRhdGVGZWVkYmFja0NvbnRlbnQiLCJjb25maXJtYXRpb25EaWFsb2ciLCJlbmFibGUiLCJjb25maXJtQ2hlY2tEaWFsb2ciLCJsMTBuIiwiY29uZmlybUNoZWNrIiwiaW5zdGFuY2UiLCIkcGFyZW50RWxlbWVudCIsInRleHRJZlN1Ym1pdHRpbmciLCJvbGRJZE1hcCIsImlkTWFwIiwiZ2V0U2h1ZmZsZU1hcCIsImFuc3dlcnNEaXNwbGF5ZWQiLCJkZXRhY2giLCJjb25maXJtUmV0cnlEaWFsb2ciLCJjb25maXJtUmV0cnkiLCJnZXRGZWVkYmFja1RleHQiLCJtYXgiLCJyYXRpbyIsImRldGVybWluZU92ZXJhbGxGZWVkYmFjayIsInNraXBGZWVkYmFjayIsInNjb3JlUG9pbnRzIiwiU2NvcmVQb2ludHMiLCJjaG9zZW4iLCJoYXNDbGFzcyIsImNvcnJlY3RBbnN3ZXIiLCJ3cm9uZ0Fuc3dlciIsImFsdGVybmF0aXZlQ29udGFpbmVyIiwicXVlcnlTZWxlY3RvciIsImFwcGVuZENoaWxkIiwiZ2V0RWxlbWVudCIsImZ1bGxTY29yZSIsInNldEZlZWRiYWNrIiwicmVtb3ZlQXR0ciIsImdldFhBUElEYXRhIiwic3RhdGVtZW50IiwiZGVmaW5pdGlvbiIsImdldFZlcmlmaWVkU3RhdGVtZW50VmFsdWUiLCJkZXNjcmlwdGlvbiIsImludGVyYWN0aW9uVHlwZSIsImNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuIiwiY2hvaWNlcyIsIm9yaWdpbmFsT3JkZXIiLCJzdWNjZXNzIiwic2V0U2NvcmVkUmVzdWx0IiwicmVzcG9uc2UiLCJyZXN1bHQiLCJwcmV2aW91c1N0YXRlIiwiayIsImoiLCJhbnMiLCJjb3VudGVyIiwiZ2V0Q3VycmVudFN0YXRlIiwic3RhdGUiLCJpZ25vcmVDaGVjayIsImdldFNjb3JlIiwiZ2V0VGl0bGUiLCJjcmVhdGVUaXRsZSIsIm1ldGFkYXRhIiwibG9hZE9ic2VydmVycyIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwic2FuaXRpemVYTUxTdHJpbmciLCJ4bWwiLCJ0aGF0IiwiaW5zdGFuY2VQYXNzZWQiLCJkb21BdHRhY2hPYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbnMiLCJmb3JFYWNoIiwibXV0YXRpb24iLCJBcnJheSIsImZyb20iLCJhZGRlZE5vZGVzIiwiYW4iLCJuYW1lIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicGFyZW50RWxlbWVudCIsInZzZUNvbnRhaW5lckRpdiIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwibG9hZFNWRyIsImFkanVzdEZyYW1lIiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJyb290Q29udGFpbmVyIiwicXVlc3Rpb25faW5zdGFuY2VfbnVtIiwid2luZG93IiwicXVlcnlTZWxlY3RvckFsbCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInF1ZXN0aW9uX2NvbnRhaW5lciIsInF1ZXN0aW9uX25vdGF0aW9uX2xpc3QiLCIkdnNlUXVlc3Rpb24iLCJnZW5lcmF0ZVVJRCIsInN2Z291dCIsIkRPTVBhcnNlciIsInBhcnNlRnJvbVN0cmluZyIsIm5vdGF0aW9uV2lkZ2V0IiwiZmlyc3RDaGlsZCIsImMiLCJtIiwiYW5zd2VyX25vdGF0aW9uIiwiaXNFbXB0eU1FSSIsInV1aWQiLCIkdnNlQW5zd2VyIiwiYW5zd2VyQ29udGFpbmVyIiwidnNlSW5zdGFuY2VzIiwidnNlQ29udGFpbmVyIiwiY29udGFpbmVyU1ZHIiwiY29udGFpbmVySGVpZ2h0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaGVpZ2h0Iiwic3R5bGUiLCJtZWkiLCJwYXJzZXIiLCJ4bWxEb2MiLCJmaXJzdFBhcnQiLCJNYXRoIiwicmFuZG9tIiwic2Vjb25kUGFydCIsInNsaWNlIl0sInNvdXJjZVJvb3QiOiIifQ==