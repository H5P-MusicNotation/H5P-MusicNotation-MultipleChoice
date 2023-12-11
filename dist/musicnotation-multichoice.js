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
        svgout = svgout.querySelector("#svgContainer");
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
          svgout = svgout.querySelector("#svgContainer");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7O0FDTjZDO0FBQ1E7O0FBRXJEO0FBQ0FQLEdBQUcsR0FBR0EsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNmQSxHQUFHLENBQUNRLHdCQUF3QixHQUFHRCx3RUFBSSxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS8uL2pzL2dsb2JhbHMuanMiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS8uL2pzL211c2ljbm90YXRpb24tbXVsdGljaG9pY2UuanMiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS8uL2Nzcy9tdXNpY25vdGF0aW9uLW11bHRpY2hvaWNlLmNzcyIsIndlYnBhY2s6Ly9tdXNpY25vdGF0aW9uX211bHRpY2hvaWNlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9tdXNpY25vdGF0aW9uX211bHRpY2hvaWNlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS8uL2VudHJpZXMvZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IEV2ZW50RGlzcGF0Y2hlciA9IEg1UC5FdmVudERpc3BhdGNoZXI7XG5leHBvcnQgY29uc3QgalF1ZXJ5ID0gSDVQLmpRdWVyeTtcbmV4cG9ydCBjb25zdCBKb3ViZWxVSSA9IEg1UC5Kb3ViZWxVSTtcbmV4cG9ydCBjb25zdCBRdWVzdGlvbiA9IEg1UC5RdWVzdGlvbjtcbmV4cG9ydCBjb25zdCBzaHVmZmxlQXJyYXkgPSBINVAuc2h1ZmZsZUFycmF5OyIsIi8vIFdpbGwgcmVuZGVyIGEgUXVlc3Rpb24gd2l0aCBtdWx0aXBsZSBjaG9pY2VzIGZvciBhbnN3ZXJzLlxuLy8gT3B0aW9ucyBmb3JtYXQ6XG4vLyB7XG4vLyAgIHRpdGxlOiBcIk9wdGlvbmFsIHRpdGxlIGZvciBxdWVzdGlvbiBib3hcIixcbi8vICAgcXVlc3Rpb246IFwiUXVlc3Rpb24gdGV4dFwiLFxuLy8gICBhbnN3ZXJzOiBbe3RleHQ6IFwiQW5zd2VyIHRleHRcIiwgY29ycmVjdDogZmFsc2V9LCAuLi5dLFxuLy8gICBzaW5nbGVBbnN3ZXI6IHRydWUsIC8vIG9yIGZhbHNlLCB3aWxsIGNoYW5nZSByZW5kZXJlZCBvdXRwdXQgc2xpZ2h0bHkuXG4vLyAgIHNpbmdsZVBvaW50OiB0cnVlLCAgLy8gVHJ1ZSBpZiBxdWVzdGlvbiBnaXZlIGEgc2luZ2xlIHBvaW50IHNjb3JlIG9ubHlcbi8vICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBhbGwgYXJlIGNvcnJlY3QsIGZhbHNlIHRvIGdpdmUgMSBwb2ludCBwZXJcbi8vICAgICAgICAgICAgICAgICAgICAgICAvLyBjb3JyZWN0IGFuc3dlci4gKE9ubHkgZm9yIHNpbmdsZUFuc3dlcj1mYWxzZSlcbi8vICAgcmFuZG9tQW5zd2VyczogZmFsc2UgIC8vIFdoZXRoZXIgdG8gcmFuZG9taXplIHRoZSBvcmRlciBvZiBhbnN3ZXJzLlxuLy8gfVxuLy9cbi8vIEV2ZW50cyBwcm92aWRlZDpcbi8vIC0gaDVwUXVlc3Rpb25BbnN3ZXJlZDogVHJpZ2dlcmVkIHdoZW4gYSBxdWVzdGlvbiBoYXMgYmVlbiBhbnN3ZXJlZC5cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBPcHRpb25zXG4gKiAgIE9wdGlvbnMgZm9yIG11bHRpcGxlIGNob2ljZVxuICpcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBiZWhhdmlvdXJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gYmVoYXZpb3VyLmNvbmZpcm1DaGVja0RpYWxvZ1xuICogQHByb3BlcnR5IHtib29sZWFufSBiZWhhdmlvdXIuY29uZmlybVJldHJ5RGlhbG9nXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IFVJXG4gKiBAcHJvcGVydHkge3N0cmluZ30gVUkudGlwc0xhYmVsXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IFtjb25maXJtUmV0cnldXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1SZXRyeS5oZWFkZXJdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1SZXRyeS5ib2R5XVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtUmV0cnkuY2FuY2VsTGFiZWxdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1SZXRyeS5jb25maXJtTGFiZWxdXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IFtjb25maXJtQ2hlY2tdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1DaGVjay5oZWFkZXJdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1DaGVjay5ib2R5XVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtjb25maXJtQ2hlY2suY2FuY2VsTGFiZWxdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1DaGVjay5jb25maXJtTGFiZWxdXG4gKi9cblxuLyoqXG4gKiBNb2R1bGUgZm9yIGNyZWF0aW5nIGEgbXVsdGlwbGUgY2hvaWNlIHF1ZXN0aW9uXG4gKlxuICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zXG4gKiBAcGFyYW0ge251bWJlcn0gY29udGVudElkXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGVudERhdGFcbiAqIEByZXR1cm5zIHtNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2V9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG4vL2ltcG9ydCBWSUJFIGZyb20gXCJ2ZXJvdmlvc2NvcmVlZGl0b3JcIjtcbmltcG9ydCB7XG4gIGpRdWVyeSBhcyAkLCBKb3ViZWxVSSBhcyBVSSwgUXVlc3Rpb24sIHNodWZmbGVBcnJheVxufVxuICBmcm9tIFwiLi9nbG9iYWxzXCI7XG5cbmNvbnN0IE1OTUMgPSAoZnVuY3Rpb24gKCkge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IG9wdGlvbnMgXG4gICAqIEBwYXJhbSB7Kn0gY29udGVudElkIFxuICAgKiBAcGFyYW0geyp9IGNvbnRlbnREYXRhIFxuICAgKiBAcmV0dXJucyBcbiAgICovXG4gIGZ1bmN0aW9uIE11c2ljTm90YXRpb25NdWx0aUNob2ljZShvcHRpb25zLCBjb250ZW50SWQsIGNvbnRlbnREYXRhKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE11c2ljTm90YXRpb25NdWx0aUNob2ljZSkpXG4gICAgICByZXR1cm4gbmV3IE11c2ljTm90YXRpb25NdWx0aUNob2ljZShvcHRpb25zLCBjb250ZW50SWQsIGNvbnRlbnREYXRhKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5jb250ZW50SWQgPSBjb250ZW50SWQ7XG4gICAgdGhpcy5jb250ZW50RGF0YSA9IGNvbnRlbnREYXRhO1xuICAgIFF1ZXN0aW9uLmNhbGwoc2VsZiwgJ211bHRpY2hvaWNlJyk7XG4gICAgdGhpcy50YXNrQ29udGFpbmVySGVpZ2h0ID0gMFxuXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgaW1hZ2U6IG51bGwsXG4gICAgICBxdWVzdGlvbjogXCJObyBxdWVzdGlvbiB0ZXh0IHByb3ZpZGVkXCIsXG4gICAgICBhbnN3ZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0aXBzQW5kRmVlZGJhY2s6IHtcbiAgICAgICAgICAgIHRpcDogJycsXG4gICAgICAgICAgICBjaG9zZW5GZWVkYmFjazogJycsXG4gICAgICAgICAgICBub3RDaG9zZW5GZWVkYmFjazogJydcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRleHQ6IFwiQW5zd2VyIDFcIixcbiAgICAgICAgICBjb3JyZWN0OiB0cnVlXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBvdmVyYWxsRmVlZGJhY2s6IFtdLFxuICAgICAgd2VpZ2h0OiAxLFxuICAgICAgdXNlckFuc3dlcnM6IFtdLFxuICAgICAgVUk6IHtcbiAgICAgICAgY2hlY2tBbnN3ZXJCdXR0b246ICdDaGVjaycsXG4gICAgICAgIHN1Ym1pdEFuc3dlckJ1dHRvbjogJ1N1Ym1pdCcsXG4gICAgICAgIHNob3dTb2x1dGlvbkJ1dHRvbjogJ1Nob3cgc29sdXRpb24nLFxuICAgICAgICB0cnlBZ2FpbkJ1dHRvbjogJ1RyeSBhZ2FpbicsXG4gICAgICAgIHNjb3JlQmFyTGFiZWw6ICdZb3UgZ290IDpudW0gb3V0IG9mIDp0b3RhbCBwb2ludHMnLFxuICAgICAgICB0aXBBdmFpbGFibGU6IFwiVGlwIGF2YWlsYWJsZVwiLFxuICAgICAgICBmZWVkYmFja0F2YWlsYWJsZTogXCJGZWVkYmFjayBhdmFpbGFibGVcIixcbiAgICAgICAgcmVhZEZlZWRiYWNrOiAnUmVhZCBmZWVkYmFjaycsXG4gICAgICAgIHNob3VsZENoZWNrOiBcIlNob3VsZCBoYXZlIGJlZW4gY2hlY2tlZFwiLFxuICAgICAgICBzaG91bGROb3RDaGVjazogXCJTaG91bGQgbm90IGhhdmUgYmVlbiBjaGVja2VkXCIsXG4gICAgICAgIG5vSW5wdXQ6ICdJbnB1dCBpcyByZXF1aXJlZCBiZWZvcmUgdmlld2luZyB0aGUgc29sdXRpb24nLFxuICAgICAgICBhMTF5Q2hlY2s6ICdDaGVjayB0aGUgYW5zd2Vycy4gVGhlIHJlc3BvbnNlcyB3aWxsIGJlIG1hcmtlZCBhcyBjb3JyZWN0LCBpbmNvcnJlY3QsIG9yIHVuYW5zd2VyZWQuJyxcbiAgICAgICAgYTExeVNob3dTb2x1dGlvbjogJ1Nob3cgdGhlIHNvbHV0aW9uLiBUaGUgdGFzayB3aWxsIGJlIG1hcmtlZCB3aXRoIGl0cyBjb3JyZWN0IHNvbHV0aW9uLicsXG4gICAgICAgIGExMXlSZXRyeTogJ1JldHJ5IHRoZSB0YXNrLiBSZXNldCBhbGwgcmVzcG9uc2VzIGFuZCBzdGFydCB0aGUgdGFzayBvdmVyIGFnYWluLicsXG4gICAgICB9LFxuICAgICAgYmVoYXZpb3VyOiB7XG4gICAgICAgIGVuYWJsZVJldHJ5OiB0cnVlLFxuICAgICAgICBlbmFibGVTb2x1dGlvbnNCdXR0b246IHRydWUsXG4gICAgICAgIGVuYWJsZUNoZWNrQnV0dG9uOiB0cnVlLFxuICAgICAgICB0eXBlOiAnYXV0bycsXG4gICAgICAgIHNpbmdsZVBvaW50OiB0cnVlLFxuICAgICAgICByYW5kb21BbnN3ZXJzOiBmYWxzZSxcbiAgICAgICAgc2hvd1NvbHV0aW9uc1JlcXVpcmVzSW5wdXQ6IHRydWUsXG4gICAgICAgIGF1dG9DaGVjazogZmFsc2UsXG4gICAgICAgIHBhc3NQZXJjZW50YWdlOiAxMDAsXG4gICAgICAgIHNob3dTY29yZVBvaW50czogdHJ1ZVxuICAgICAgfVxuICAgIH07XG4gICAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHRydWUsIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIGNvbnNvbGUubG9nKFwiTXVsdGljaG9pY2VcIiwgcGFyYW1zKVxuXG4gICAgLy9hcnJheSBvZiBjb250YWluZXJzLiB3aWxsIGJlIHVzZWQgZm9yIHNjYWxpbmcgbGF0ZXJcbiAgICAvLyB0aGlzLnZpYmVDb250YWluZXIgPSBbXVxuICAgIC8vIHRoaXMudmliZUluc3RhbmNlcyA9IFtdXG5cbiAgICAvLyBLZWVwIHRyYWNrIG9mIG51bWJlciBvZiBjb3JyZWN0IGNob2ljZXNcbiAgICB2YXIgbnVtQ29ycmVjdCA9IDA7XG5cbiAgICAvLyBMb29wIHRocm91Z2ggY2hvaWNlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhbnN3ZXIgPSBwYXJhbXMuYW5zd2Vyc1tpXTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRpcHMgYW5kIGZlZWRiYWNrIGV4aXN0c1xuICAgICAgYW5zd2VyLnRpcHNBbmRGZWVkYmFjayA9IGFuc3dlci50aXBzQW5kRmVlZGJhY2sgfHwge307XG5cbiAgICAgIGlmIChwYXJhbXMuYW5zd2Vyc1tpXS5jb3JyZWN0KSB7XG4gICAgICAgIC8vIFVwZGF0ZSBudW1iZXIgb2YgY29ycmVjdCBjaG9pY2VzXG4gICAgICAgIG51bUNvcnJlY3QrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgbm8gY2hvaWNlcyBpcyB0aGUgY29ycmVjdFxuICAgIHZhciBibGFua0lzQ29ycmVjdCA9IChudW1Db3JyZWN0ID09PSAwKTtcblxuICAgIC8vIERldGVybWluZSB0YXNrIHR5cGVcbiAgICBpZiAocGFyYW1zLmJlaGF2aW91ci50eXBlID09PSAnYXV0bycpIHtcbiAgICAgIC8vIFVzZSBzaW5nbGUgY2hvaWNlIGlmIG9ubHkgb25lIGNob2ljZSBpcyBjb3JyZWN0XG4gICAgICBwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciA9IChudW1Db3JyZWN0ID09PSAxKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciA9IChwYXJhbXMuYmVoYXZpb3VyLnR5cGUgPT09ICdzaW5nbGUnKTtcbiAgICB9XG5cbiAgICB2YXIgZ2V0Q2hlY2tib3hPclJhZGlvSWNvbiA9IGZ1bmN0aW9uIChyYWRpbywgc2VsZWN0ZWQpIHtcbiAgICAgIHZhciBpY29uO1xuICAgICAgaWYgKHJhZGlvKSB7XG4gICAgICAgIGljb24gPSBzZWxlY3RlZCA/ICcmI3hlNjAzOycgOiAnJiN4ZTYwMDsnO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGljb24gPSBzZWxlY3RlZCA/ICcmI3hlNjAxOycgOiAnJiN4ZTYwMjsnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGljb247XG4gICAgfTtcblxuICAgIC8vIEluaXRpYWxpemUgYnV0dG9ucyBhbmQgZWxlbWVudHMuXG4gICAgdmFyICRteURvbTtcbiAgICB2YXIgJGZlZWRiYWNrRGlhbG9nO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBmZWVkYmFjayBkaWFsb2dzXG4gICAgICovXG4gICAgdmFyIHJlbW92ZUZlZWRiYWNrRGlhbG9nID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gUmVtb3ZlIHRoZSBvcGVuIGZlZWRiYWNrIGRpYWxvZ3MuXG4gICAgICAkbXlEb20udW5iaW5kKCdjbGljaycsIHJlbW92ZUZlZWRiYWNrRGlhbG9nKTtcbiAgICAgICRteURvbS5maW5kKCcuaDVwLWZlZWRiYWNrLWJ1dHRvbiwgLmg1cC1mZWVkYmFjay1kaWFsb2cnKS5yZW1vdmUoKTtcbiAgICAgICRteURvbS5maW5kKCcuaDVwLWhhcy1mZWVkYmFjaycpLnJlbW92ZUNsYXNzKCdoNXAtaGFzLWZlZWRiYWNrJyk7XG4gICAgICBpZiAoJGZlZWRiYWNrRGlhbG9nKSB7XG4gICAgICAgICRmZWVkYmFja0RpYWxvZy5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNjb3JlID0gMDtcbiAgICB2YXIgc29sdXRpb25zVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQWRkIGZlZWRiYWNrIHRvIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgRWxlbWVudCB0aGF0IGZlZWRiYWNrIHdpbGwgYmUgYWRkZWQgdG9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmVlZGJhY2sgRmVlZGJhY2sgc3RyaW5nXG4gICAgICovXG4gICAgdmFyIGFkZEZlZWRiYWNrID0gZnVuY3Rpb24gKCRlbGVtZW50LCBmZWVkYmFjaykge1xuICAgICAgJGZlZWRiYWNrRGlhbG9nID0gJCgnJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiaDVwLWZlZWRiYWNrLWRpYWxvZ1wiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImg1cC1mZWVkYmFjay1pbm5lclwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImg1cC1mZWVkYmFjay10ZXh0XCI+JyArIGZlZWRiYWNrICsgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nKTtcblxuICAgICAgLy9tYWtlIHN1cmUgZmVlZGJhY2sgaXMgb25seSBhZGRlZCBvbmNlXG4gICAgICBpZiAoISRlbGVtZW50LmZpbmQoJCgnLmg1cC1mZWVkYmFjay1kaWFsb2cnKSkubGVuZ3RoKSB7XG4gICAgICAgICRmZWVkYmFja0RpYWxvZy5hcHBlbmRUbygkZWxlbWVudC5hZGRDbGFzcygnaDVwLWhhcy1mZWVkYmFjaycpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgdGhlIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgdGFzayB3aXRoIHRoZSBRdWVzdGlvbiBzdHJ1Y3R1cmUuXG4gICAgICovXG4gICAgc2VsZi5yZWdpc3RlckRvbUVsZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG1lZGlhID0gcGFyYW1zLm1lZGlhO1xuICAgICAgaWYgKG1lZGlhICYmIG1lZGlhLnR5cGUgJiYgbWVkaWEudHlwZS5saWJyYXJ5KSB7XG4gICAgICAgIG1lZGlhID0gbWVkaWEudHlwZTtcbiAgICAgICAgdmFyIHR5cGUgPSBtZWRpYS5saWJyYXJ5LnNwbGl0KCcgJylbMF07XG4gICAgICAgIGlmICh0eXBlID09PSAnSDVQLkltYWdlJykge1xuICAgICAgICAgIGlmIChtZWRpYS5wYXJhbXMuZmlsZSkge1xuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgdGFzayBpbWFnZVxuICAgICAgICAgICAgc2VsZi5zZXRJbWFnZShtZWRpYS5wYXJhbXMuZmlsZS5wYXRoLCB7XG4gICAgICAgICAgICAgIGRpc2FibGVJbWFnZVpvb21pbmc6IHBhcmFtcy5tZWRpYS5kaXNhYmxlSW1hZ2Vab29taW5nIHx8IGZhbHNlLFxuICAgICAgICAgICAgICBhbHQ6IG1lZGlhLnBhcmFtcy5hbHQsXG4gICAgICAgICAgICAgIHRpdGxlOiBtZWRpYS5wYXJhbXMudGl0bGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnSDVQLlZpZGVvJykge1xuICAgICAgICAgIGlmIChtZWRpYS5wYXJhbXMuc291cmNlcykge1xuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgdGFzayB2aWRlb1xuICAgICAgICAgICAgc2VsZi5zZXRWaWRlbyhtZWRpYSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdINVAuQXVkaW8nKSB7XG4gICAgICAgICAgaWYgKG1lZGlhLnBhcmFtcy5maWxlcykge1xuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgdGFzayBhdWRpb1xuICAgICAgICAgICAgc2VsZi5zZXRBdWRpbyhtZWRpYSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIERldGVybWluZSBpZiB3ZSdyZSB1c2luZyBjaGVja2JveGVzIG9yIHJhZGlvIGJ1dHRvbnNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFyYW1zLmFuc3dlcnNbaV0uY2hlY2tib3hPclJhZGlvSWNvbiA9IGdldENoZWNrYm94T3JSYWRpb0ljb24ocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIsIHBhcmFtcy51c2VyQW5zd2Vycy5pbmRleE9mKGkpID4gLTEpO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWdpc3RlciBJbnRyb2R1Y3Rpb25cbiAgICAgIHNlbGYuc2V0SW50cm9kdWN0aW9uKCc8ZGl2IGlkPVwiJyArIHBhcmFtcy5sYWJlbElkICsgJ1wiPicgKyBwYXJhbXMucXVlc3Rpb24gKyAnPC9kaXY+Jyk7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHRhc2sgY29udGVudCBhcmVhXG4gICAgICAkbXlEb20gPSAkKCc8dWw+Jywge1xuICAgICAgICAnY2xhc3MnOiAnaDVwLWFuc3dlcnMnLFxuICAgICAgICByb2xlOiBwYXJhbXMucm9sZSxcbiAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IHBhcmFtcy5sYWJlbElkXG4gICAgICB9KTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBhbnN3ZXIgPSBwYXJhbXMuYW5zd2Vyc1tpXTtcbiAgICAgICAgJCgnPGxpPicsIHtcbiAgICAgICAgICAnY2xhc3MnOiAnaDVwLWFuc3dlcicsXG4gICAgICAgICAgcm9sZTogYW5zd2VyLnJvbGUsXG4gICAgICAgICAgdGFiaW5kZXg6IGFuc3dlci50YWJpbmRleCxcbiAgICAgICAgICAnYXJpYS1jaGVja2VkJzogYW5zd2VyLmNoZWNrZWQsXG4gICAgICAgICAgJ2RhdGEtaWQnOiBpLFxuICAgICAgICAgIGh0bWw6ICc8ZGl2IGNsYXNzPVwiaDVwLWFsdGVybmF0aXZlLWNvbnRhaW5lclwiIGFuc3dlci1pZD1cIicgKyBpLnRvU3RyaW5nKCkgKyAnXCI+PHNwYW4gY2xhc3M9XCJoNXAtYWx0ZXJuYXRpdmUtaW5uZXJcIj4nICsgYW5zd2VyLnRleHQgKyAnPC9zcGFuPjwvZGl2PicsXG4gICAgICAgICAgYXBwZW5kVG86ICRteURvbVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5zZXRDb250ZW50KCRteURvbSwge1xuICAgICAgICAnY2xhc3MnOiBwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciA/ICdoNXAtcmFkaW8nIDogJ2g1cC1jaGVjaydcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDcmVhdGUgdGlwczpcbiAgICAgIHZhciAkYW5zd2VycyA9ICQoJy5oNXAtYW5zd2VyJywgJG15RG9tKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG5cbiAgICAgICAgdmFyIHRpcCA9IHBhcmFtcy5hbnN3ZXJzW2ldLnRpcHNBbmRGZWVkYmFjay50aXA7XG4gICAgICAgIGlmICh0aXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybjsgLy8gTm8gdGlwXG4gICAgICAgIH1cblxuICAgICAgICB0aXAgPSB0aXAudHJpbSgpO1xuICAgICAgICB2YXIgdGlwQ29udGVudCA9IHRpcFxuICAgICAgICAgIC5yZXBsYWNlKC8mbmJzcDsvZywgJycpXG4gICAgICAgICAgLnJlcGxhY2UoLzxwPi9nLCAnJylcbiAgICAgICAgICAucmVwbGFjZSgvPFxcL3A+L2csICcnKVxuICAgICAgICAgIC50cmltKCk7XG4gICAgICAgIGlmICghdGlwQ29udGVudC5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm47IC8vIEVtcHR5IHRpcFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2g1cC1oYXMtdGlwJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgdGlwXG4gICAgICAgIHZhciAkd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgICAnY2xhc3MnOiAnaDVwLW11bHRpY2hvaWNlLXRpcHdyYXAnLFxuICAgICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLnRpcEF2YWlsYWJsZSArICcuJ1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgJG11bHRpY2hvaWNlVGlwID0gJCgnPGRpdj4nLCB7XG4gICAgICAgICAgJ3JvbGUnOiAnYnV0dG9uJyxcbiAgICAgICAgICAndGFiaW5kZXgnOiAwLFxuICAgICAgICAgICd0aXRsZSc6IHBhcmFtcy5VSS50aXBzTGFiZWwsXG4gICAgICAgICAgJ2FyaWEtbGFiZWwnOiBwYXJhbXMuVUkudGlwc0xhYmVsLFxuICAgICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICAgJ2NsYXNzJzogJ211bHRpY2hvaWNlLXRpcCcsXG4gICAgICAgICAgYXBwZW5kVG86ICR3cmFwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB0aXBJY29uSHRtbCA9ICc8c3BhbiBjbGFzcz1cImpvdWJlbC1pY29uLXRpcC1ub3JtYWxcIj4nICtcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJoNXAtaWNvbi1zaGFkb3dcIj48L3NwYW4+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaDVwLWljb24tc3BlZWNoLWJ1YmJsZVwiPjwvc3Bhbj4nICtcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJoNXAtaWNvbi1pbmZvXCI+PC9zcGFuPicgK1xuICAgICAgICAgICc8L3NwYW4+JztcblxuICAgICAgICAkbXVsdGljaG9pY2VUaXAuYXBwZW5kKHRpcEljb25IdG1sKTtcblxuICAgICAgICAkbXVsdGljaG9pY2VUaXAuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciAkdGlwQ29udGFpbmVyID0gJG11bHRpY2hvaWNlVGlwLnBhcmVudHMoJy5oNXAtYW5zd2VyJyk7XG4gICAgICAgICAgdmFyIG9wZW5GZWVkYmFjayA9ICEkdGlwQ29udGFpbmVyLmNoaWxkcmVuKCcuaDVwLWZlZWRiYWNrLWRpYWxvZycpLmlzKCRmZWVkYmFja0RpYWxvZyk7XG4gICAgICAgICAgcmVtb3ZlRmVlZGJhY2tEaWFsb2coKTtcblxuICAgICAgICAgIC8vIERvIG5vdCBvcGVuIGZlZWRiYWNrIGlmIGl0IHdhcyBvcGVuXG4gICAgICAgICAgaWYgKG9wZW5GZWVkYmFjaykge1xuICAgICAgICAgICAgJG11bHRpY2hvaWNlVGlwLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gQWRkIHRpcCBkaWFsb2dcbiAgICAgICAgICAgIGFkZEZlZWRiYWNrKCR0aXBDb250YWluZXIsIHRpcCk7XG4gICAgICAgICAgICAkZmVlZGJhY2tEaWFsb2cuYWRkQ2xhc3MoJ2g1cC1oYXMtdGlwJyk7XG5cbiAgICAgICAgICAgIC8vIFRpcCBmb3IgcmVhZHNwZWFrZXJcbiAgICAgICAgICAgIHNlbGYucmVhZCh0aXApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICRtdWx0aWNob2ljZVRpcC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYudHJpZ2dlcigncmVzaXplJyk7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgdGlwIGRpYWxvZyBvbiBkb20gY2xpY2tcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRteURvbS5jbGljayhyZW1vdmVGZWVkYmFja0RpYWxvZyk7XG4gICAgICAgICAgfSwgMTAwKTtcblxuICAgICAgICAgIC8vIERvIG5vdCBwcm9wYWdhdGVcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pLmtleWRvd24oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMzIpIHtcbiAgICAgICAgICAgICQodGhpcykuY2xpY2soKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5oNXAtYWx0ZXJuYXRpdmUtY29udGFpbmVyJywgdGhpcykuYXBwZW5kKCR3cmFwKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTZXQgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAgdmFyIHRvZ2dsZUNoZWNrID0gZnVuY3Rpb24gKCRhbnMpIHtcbiAgICAgICAgaWYgKCRhbnMuYXR0cignYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5hbnN3ZXJlZCA9IHRydWU7XG4gICAgICAgIHZhciBudW0gPSBwYXJzZUludCgkYW5zLmRhdGEoJ2lkJykpO1xuICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgICAvLyBTdG9yZSBhbnN3ZXJcbiAgICAgICAgICBwYXJhbXMudXNlckFuc3dlcnMgPSBbbnVtXTtcblxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBzY29yZVxuICAgICAgICAgIHNjb3JlID0gKHBhcmFtcy5hbnN3ZXJzW251bV0uY29ycmVjdCA/IDEgOiAwKTtcblxuICAgICAgICAgIC8vIERlLXNlbGVjdCBwcmV2aW91cyBhbnN3ZXJcbiAgICAgICAgICAkYW5zd2Vycy5ub3QoJGFucykucmVtb3ZlQ2xhc3MoJ2g1cC1zZWxlY3RlZCcpLmF0dHIoJ3RhYmluZGV4JywgJy0xJykuYXR0cignYXJpYS1jaGVja2VkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAvLyBTZWxlY3QgbmV3IGFuc3dlclxuICAgICAgICAgICRhbnMuYWRkQ2xhc3MoJ2g1cC1zZWxlY3RlZCcpLmF0dHIoJ3RhYmluZGV4JywgJzAnKS5hdHRyKCdhcmlhLWNoZWNrZWQnLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICgkYW5zLmF0dHIoJ2FyaWEtY2hlY2tlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHBhcmFtcy51c2VyQW5zd2Vycy5pbmRleE9mKG51bSk7XG4gICAgICAgICAgICBpZiAocG9zICE9PSAtMSkge1xuICAgICAgICAgICAgICBwYXJhbXMudXNlckFuc3dlcnMuc3BsaWNlKHBvcywgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERvIG5vdCBhbGxvdyB1bi1jaGVja2luZyB3aGVuIHJldHJ5IGRpc2FibGVkIGFuZCBhdXRvIGNoZWNrXG4gICAgICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5hdXRvQ2hlY2sgJiYgIXBhcmFtcy5iZWhhdmlvdXIuZW5hYmxlUmV0cnkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZW1vdmUgY2hlY2tcbiAgICAgICAgICAgICRhbnMucmVtb3ZlQ2xhc3MoJ2g1cC1zZWxlY3RlZCcpLmF0dHIoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBhcmFtcy51c2VyQW5zd2Vycy5wdXNoKG51bSk7XG4gICAgICAgICAgICAkYW5zLmFkZENsYXNzKCdoNXAtc2VsZWN0ZWQnKS5hdHRyKCdhcmlhLWNoZWNrZWQnLCAndHJ1ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBzY29yZVxuICAgICAgICAgIGNhbGNTY29yZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi50cmlnZ2VyWEFQSSgnaW50ZXJhY3RlZCcpO1xuICAgICAgICBoaWRlU29sdXRpb24oJGFucyk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICBzZWxmLnNob3dCdXR0b24oJ2NoZWNrLWFuc3dlcicpO1xuICAgICAgICAgIHNlbGYuaGlkZUJ1dHRvbigndHJ5LWFnYWluJyk7XG4gICAgICAgICAgc2VsZi5oaWRlQnV0dG9uKCdzaG93LXNvbHV0aW9uJyk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5hdXRvQ2hlY2spIHtcbiAgICAgICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAgICAgICAvLyBPbmx5IGEgc2luZ2xlIGFuc3dlciBhbGxvd2VkXG4gICAgICAgICAgICAgIGNoZWNrQW5zd2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gU2hvdyBmZWVkYmFjayBmb3Igc2VsZWN0ZWQgYWx0ZXJuYXRpdmVzXG4gICAgICAgICAgICAgIHNlbGYuc2hvd0NoZWNrU29sdXRpb24odHJ1ZSk7XG5cbiAgICAgICAgICAgICAgLy8gQWx3YXlzIGZpbmlzaCB0YXNrIGlmIGl0IHdhcyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgIGlmIChzY29yZSA9PT0gc2VsZi5nZXRNYXhTY29yZSgpKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tBbnN3ZXIoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJGFuc3dlcnMuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0b2dnbGVDaGVjaygkKHRoaXMpKTtcbiAgICAgIH0pLmtleWRvd24oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHsgLy8gU3BhY2UgYmFyXG4gICAgICAgICAgLy8gU2VsZWN0IGN1cnJlbnQgaXRlbVxuICAgICAgICAgIHRvZ2dsZUNoZWNrKCQodGhpcykpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDM4OiAgIC8vIFVwXG4gICAgICAgICAgICBjYXNlIDM3OiB7IC8vIExlZnRcbiAgICAgICAgICAgICAgLy8gVHJ5IHRvIHNlbGVjdCBwcmV2aW91cyBpdGVtXG4gICAgICAgICAgICAgIHZhciAkcHJldiA9ICQodGhpcykucHJldigpO1xuICAgICAgICAgICAgICBpZiAoJHByZXYubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2hlY2soJHByZXYuZm9jdXMoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSA0MDogICAvLyBEb3duXG4gICAgICAgICAgICBjYXNlIDM5OiB7IC8vIFJpZ2h0XG4gICAgICAgICAgICAgIC8vIFRyeSB0byBzZWxlY3QgbmV4dCBpdGVtXG4gICAgICAgICAgICAgIHZhciAkbmV4dCA9ICQodGhpcykubmV4dCgpO1xuICAgICAgICAgICAgICBpZiAoJG5leHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2hlY2soJG5leHQuZm9jdXMoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAvLyBTcGVjaWFsIGZvY3VzIGhhbmRsZXIgZm9yIHJhZGlvIGJ1dHRvbnNcbiAgICAgICAgJGFuc3dlcnMuZm9jdXMoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICgkKHRoaXMpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnKSAhPT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAkYW5zd2Vycy5ub3QodGhpcykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmJsdXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICghJGFuc3dlcnMuZmlsdGVyKCcuaDVwLXNlbGVjdGVkJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAkYW5zd2Vycy5maXJzdCgpLmFkZCgkYW5zd2Vycy5sYXN0KCkpLmF0dHIoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGRzIGNoZWNrIGFuZCByZXRyeSBidXR0b25cbiAgICAgIGFkZEJ1dHRvbnMoKTtcbiAgICAgIGlmICghcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcblxuICAgICAgICBjYWxjU2NvcmUoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAocGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aCAmJiBwYXJhbXMuYW5zd2Vyc1twYXJhbXMudXNlckFuc3dlcnNbMF1dLmNvcnJlY3QpIHtcbiAgICAgICAgICBzY29yZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2NvcmUgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEhhcyBhbnN3ZXJlZCB0aHJvdWdoIGF1dG8tY2hlY2sgaW4gYSBwcmV2aW91cyBzZXNzaW9uXG4gICAgICBpZiAoaGFzQ2hlY2tlZEFuc3dlciAmJiBwYXJhbXMuYmVoYXZpb3VyLmF1dG9DaGVjaykge1xuXG4gICAgICAgIC8vIENoZWNrIGFuc3dlcnMgaWYgYW5zd2VyIGhhcyBiZWVuIGdpdmVuIG9yIG1heCBzY29yZSByZWFjaGVkXG4gICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciB8fCBzY29yZSA9PT0gc2VsZi5nZXRNYXhTY29yZSgpKSB7XG4gICAgICAgICAgY2hlY2tBbnN3ZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBTaG93IGZlZWRiYWNrIGZvciBjaGVja2VkIGNoZWNrYm94ZXNcbiAgICAgICAgICBzZWxmLnNob3dDaGVja1NvbHV0aW9uKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuc2hvd0FsbFNvbHV0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzb2x1dGlvbnNWaXNpYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNvbHV0aW9uc1Zpc2libGUgPSB0cnVlO1xuXG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXInKS5lYWNoKGZ1bmN0aW9uIChpLCBlKSB7XG4gICAgICAgIHZhciAkZSA9ICQoZSk7XG4gICAgICAgIHZhciBhID0gcGFyYW1zLmFuc3dlcnNbaV07XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9ICdoNXAtc29sdXRpb24taWNvbi0nICsgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyID8gJ3JhZGlvJyA6ICdjaGVja2JveCcpO1xuXG4gICAgICAgIGlmIChhLmNvcnJlY3QpIHtcbiAgICAgICAgICAkZS5hZGRDbGFzcygnaDVwLXNob3VsZCcpLmFwcGVuZCgkKCc8c3Bhbi8+Jywge1xuICAgICAgICAgICAgJ2NsYXNzJzogY2xhc3NOYW1lLFxuICAgICAgICAgICAgaHRtbDogcGFyYW1zLlVJLnNob3VsZENoZWNrICsgJy4nXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICRlLmFkZENsYXNzKCdoNXAtc2hvdWxkLW5vdCcpLmFwcGVuZCgkKCc8c3Bhbi8+Jywge1xuICAgICAgICAgICAgJ2NsYXNzJzogY2xhc3NOYW1lLFxuICAgICAgICAgICAgaHRtbDogcGFyYW1zLlVJLnNob3VsZE5vdENoZWNrICsgJy4nXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9KS5maW5kKCcuaDVwLXF1ZXN0aW9uLXBsdXMtb25lLCAuaDVwLXF1ZXN0aW9uLW1pbnVzLW9uZScpLnJlbW92ZSgpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgaW5wdXQgaXMgZGlzYWJsZWQgaW4gc29sdXRpb24gbW9kZVxuICAgICAgZGlzYWJsZUlucHV0KCk7XG5cbiAgICAgIC8vIE1vdmUgZm9jdXMgYmFjayB0byB0aGUgZmlyc3QgYWx0ZXJuYXRpdmUgc28gdGhhdCB0aGUgdXNlciBiZWNvbWVzXG4gICAgICAvLyBhd2FyZSB0aGF0IHRoZSBzb2x1dGlvbiBpcyBiZWluZyBzaG93bi5cbiAgICAgICRteURvbS5maW5kKCcuaDVwLWFuc3dlcjpmaXJzdC1jaGlsZCcpLmZvY3VzKCk7XG5cbiAgICAgIC8vSGlkZSBidXR0b25zIGFuZCByZXRyeSBkZXBlbmRpbmcgb24gc2V0dGluZ3MuXG4gICAgICBzZWxmLmhpZGVCdXR0b24oJ2NoZWNrLWFuc3dlcicpO1xuICAgICAgc2VsZi5oaWRlQnV0dG9uKCdzaG93LXNvbHV0aW9uJyk7XG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5lbmFibGVSZXRyeSkge1xuICAgICAgICBzZWxmLnNob3dCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgICAgfVxuICAgICAgc2VsZi50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXNlZCBpbiBjb250cmFjdHMuXG4gICAgICogU2hvd3MgdGhlIHNvbHV0aW9uIGZvciB0aGUgdGFzayBhbmQgaGlkZXMgYWxsIGJ1dHRvbnMuXG4gICAgICovXG4gICAgdGhpcy5zaG93U29sdXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmVtb3ZlRmVlZGJhY2tEaWFsb2coKTtcbiAgICAgIHNlbGYuc2hvd0NoZWNrU29sdXRpb24oKTtcbiAgICAgIHNlbGYuc2hvd0FsbFNvbHV0aW9ucygpO1xuICAgICAgZGlzYWJsZUlucHV0KCk7XG4gICAgICBzZWxmLmhpZGVCdXR0b24oJ3RyeS1hZ2FpbicpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHNvbHV0aW9uIGZvciB0aGUgZ2l2ZW4gYW5zd2VyKHMpXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkYW5zd2VyXG4gICAgICovXG4gICAgdmFyIGhpZGVTb2x1dGlvbiA9IGZ1bmN0aW9uICgkYW5zd2VyKSB7XG4gICAgICAkYW5zd2VyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaDVwLWNvcnJlY3QnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC13cm9uZycpXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaDVwLXNob3VsZCcpXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaDVwLXNob3VsZC1ub3QnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1oYXMtZmVlZGJhY2snKVxuICAgICAgICAuZmluZCgnLmg1cC1xdWVzdGlvbi1wbHVzLW9uZSwgJyArXG4gICAgICAgICAgJy5oNXAtcXVlc3Rpb24tbWludXMtb25lLCAnICtcbiAgICAgICAgICAnLmg1cC1hbnN3ZXItaWNvbiwgJyArXG4gICAgICAgICAgJy5oNXAtc29sdXRpb24taWNvbi1yYWRpbywgJyArXG4gICAgICAgICAgJy5oNXAtc29sdXRpb24taWNvbi1jaGVja2JveCwgJyArXG4gICAgICAgICAgJy5oNXAtZmVlZGJhY2stZGlhbG9nJylcbiAgICAgICAgLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqL1xuICAgIHRoaXMuaGlkZVNvbHV0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNvbHV0aW9uc1Zpc2libGUgPSBmYWxzZTtcblxuICAgICAgaGlkZVNvbHV0aW9uKCQoJy5oNXAtYW5zd2VyJywgJG15RG9tKSk7XG5cbiAgICAgIHRoaXMucmVtb3ZlRmVlZGJhY2soKTsgLy8gUmVzZXQgZmVlZGJhY2tcblxuICAgICAgc2VsZi50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSB3aG9sZSB0YXNrLlxuICAgICAqIFVzZWQgaW4gY29udHJhY3RzIHdpdGggaW50ZWdyYXRlZCBjb250ZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5yZXNldFRhc2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLmFuc3dlcmVkID0gZmFsc2U7XG4gICAgICBzZWxmLmhpZGVTb2x1dGlvbnMoKTtcbiAgICAgIHBhcmFtcy51c2VyQW5zd2VycyA9IFtdO1xuICAgICAgcmVtb3ZlU2VsZWN0aW9ucygpO1xuICAgICAgc2VsZi5zaG93QnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcbiAgICAgIHNlbGYuaGlkZUJ1dHRvbigndHJ5LWFnYWluJyk7XG4gICAgICBzZWxmLmhpZGVCdXR0b24oJ3Nob3ctc29sdXRpb24nKTtcbiAgICAgIGVuYWJsZUlucHV0KCk7XG4gICAgICAkbXlEb20uZmluZCgnLmg1cC1mZWVkYmFjay1hdmFpbGFibGUnKS5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgdmFyIGNhbGN1bGF0ZU1heFNjb3JlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGJsYW5rSXNDb3JyZWN0KSB7XG4gICAgICAgIHJldHVybiBwYXJhbXMud2VpZ2h0O1xuICAgICAgfVxuICAgICAgdmFyIG1heFNjb3JlID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNob2ljZSA9IHBhcmFtcy5hbnN3ZXJzW2ldO1xuICAgICAgICBpZiAoY2hvaWNlLmNvcnJlY3QpIHtcbiAgICAgICAgICBtYXhTY29yZSArPSAoY2hvaWNlLndlaWdodCAhPT0gdW5kZWZpbmVkID8gY2hvaWNlLndlaWdodCA6IDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4U2NvcmU7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0TWF4U2NvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKCFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciAmJiAhcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVQb2ludCA/IGNhbGN1bGF0ZU1heFNjb3JlKCkgOiBwYXJhbXMud2VpZ2h0KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgYW5zd2VyXG4gICAgICovXG4gICAgdmFyIGNoZWNrQW5zd2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gVW5iaW5kIHJlbW92YWwgb2YgZmVlZGJhY2sgZGlhbG9ncyBvbiBjbGlja1xuICAgICAgJG15RG9tLnVuYmluZCgnY2xpY2snLCByZW1vdmVGZWVkYmFja0RpYWxvZyk7XG5cbiAgICAgIC8vIFJlbW92ZSBhbGwgdGlwIGRpYWxvZ3NcbiAgICAgIHJlbW92ZUZlZWRiYWNrRGlhbG9nKCk7XG5cbiAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLmVuYWJsZVNvbHV0aW9uc0J1dHRvbikge1xuICAgICAgICBzZWxmLnNob3dCdXR0b24oJ3Nob3ctc29sdXRpb24nKTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLmVuYWJsZVJldHJ5KSB7XG4gICAgICAgIHNlbGYuc2hvd0J1dHRvbigndHJ5LWFnYWluJyk7XG4gICAgICB9XG4gICAgICBzZWxmLmhpZGVCdXR0b24oJ2NoZWNrLWFuc3dlcicpO1xuXG4gICAgICBzZWxmLnNob3dDaGVja1NvbHV0aW9uKCk7XG4gICAgICBkaXNhYmxlSW5wdXQoKTtcblxuICAgICAgdmFyIHhBUElFdmVudCA9IHNlbGYuY3JlYXRlWEFQSUV2ZW50VGVtcGxhdGUoJ2Fuc3dlcmVkJyk7XG4gICAgICBhZGRRdWVzdGlvblRvWEFQSSh4QVBJRXZlbnQpO1xuICAgICAgYWRkUmVzcG9uc2VUb1hBUEkoeEFQSUV2ZW50KTtcbiAgICAgIHNlbGYudHJpZ2dlcih4QVBJRXZlbnQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSB1aSBidXR0b25zLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdmFyIGFkZEJ1dHRvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKCdbZGF0YS1jb250ZW50LWlkPVwiJyArIHNlbGYuY29udGVudElkICsgJ1wiXS5oNXAtY29udGVudCcpO1xuICAgICAgdmFyICRjb250YWluZXJQYXJlbnRzID0gJGNvbnRlbnQucGFyZW50cygnLmg1cC1jb250YWluZXInKTtcblxuICAgICAgLy8gc2VsZWN0IGZpbmQgY29udGFpbmVyIHRvIGF0dGFjaCBkaWFsb2dzIHRvXG4gICAgICB2YXIgJGNvbnRhaW5lcjtcbiAgICAgIGlmICgkY29udGFpbmVyUGFyZW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gdXNlIHBhcmVudCBoaWdoZXN0IHVwIGlmIGFueVxuICAgICAgICAkY29udGFpbmVyID0gJGNvbnRhaW5lclBhcmVudHMubGFzdCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoJGNvbnRlbnQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICRjb250YWluZXIgPSAkY29udGVudDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkY29udGFpbmVyID0gJChkb2N1bWVudC5ib2R5KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2hvdyBzb2x1dGlvbiBidXR0b25cbiAgICAgIHNlbGYuYWRkQnV0dG9uKCdzaG93LXNvbHV0aW9uJywgcGFyYW1zLlVJLnNob3dTb2x1dGlvbkJ1dHRvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaG93U29sdXRpb25zUmVxdWlyZXNJbnB1dCAmJiAhc2VsZi5nZXRBbnN3ZXJHaXZlbih0cnVlKSkge1xuICAgICAgICAgIC8vIFJlcXVpcmUgYW5zd2VyIGJlZm9yZSBzb2x1dGlvbiBjYW4gYmUgdmlld2VkXG4gICAgICAgICAgc2VsZi51cGRhdGVGZWVkYmFja0NvbnRlbnQocGFyYW1zLlVJLm5vSW5wdXQpO1xuICAgICAgICAgIHNlbGYucmVhZChwYXJhbXMuVUkubm9JbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY2FsY1Njb3JlKCk7XG4gICAgICAgICAgc2VsZi5zaG93QWxsU29sdXRpb25zKCk7XG4gICAgICAgIH1cblxuICAgICAgfSwgZmFsc2UsIHtcbiAgICAgICAgJ2FyaWEtbGFiZWwnOiBwYXJhbXMuVUkuYTExeVNob3dTb2x1dGlvbixcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDaGVjayBidXR0b25cbiAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLmVuYWJsZUNoZWNrQnV0dG9uICYmICghcGFyYW1zLmJlaGF2aW91ci5hdXRvQ2hlY2sgfHwgIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSkge1xuICAgICAgICBzZWxmLmFkZEJ1dHRvbignY2hlY2stYW5zd2VyJywgcGFyYW1zLlVJLmNoZWNrQW5zd2VyQnV0dG9uLFxuICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuYW5zd2VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2hlY2tBbnN3ZXIoKTtcbiAgICAgICAgICAgICRteURvbS5maW5kKCcuaDVwLWFuc3dlcjpmaXJzdC1jaGlsZCcpLmZvY3VzKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogcGFyYW1zLlVJLmExMXlDaGVjayxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbmZpcm1hdGlvbkRpYWxvZzoge1xuICAgICAgICAgICAgICBlbmFibGU6IHBhcmFtcy5iZWhhdmlvdXIuY29uZmlybUNoZWNrRGlhbG9nLFxuICAgICAgICAgICAgICBsMTBuOiBwYXJhbXMuY29uZmlybUNoZWNrLFxuICAgICAgICAgICAgICBpbnN0YW5jZTogc2VsZixcbiAgICAgICAgICAgICAgJHBhcmVudEVsZW1lbnQ6ICRjb250YWluZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50RGF0YTogc2VsZi5jb250ZW50RGF0YSxcbiAgICAgICAgICAgIHRleHRJZlN1Ym1pdHRpbmc6IHBhcmFtcy5VSS5zdWJtaXRBbnN3ZXJCdXR0b24sXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBUcnkgQWdhaW4gYnV0dG9uXG4gICAgICBzZWxmLmFkZEJ1dHRvbigndHJ5LWFnYWluJywgcGFyYW1zLlVJLnRyeUFnYWluQnV0dG9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucmVzZXRUYXNrKCk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIucmFuZG9tQW5zd2Vycykge1xuICAgICAgICAgIC8vIHJlc2h1ZmZsZSBhbnN3ZXJzXG4gICAgICAgICAgdmFyIG9sZElkTWFwID0gaWRNYXA7XG4gICAgICAgICAgaWRNYXAgPSBnZXRTaHVmZmxlTWFwKCk7XG4gICAgICAgICAgdmFyIGFuc3dlcnNEaXNwbGF5ZWQgPSAkbXlEb20uZmluZCgnLmg1cC1hbnN3ZXInKTtcbiAgICAgICAgICAvLyByZW1lbWJlciB0aXBzXG4gICAgICAgICAgdmFyIHRpcCA9IFtdO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhbnN3ZXJzRGlzcGxheWVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aXBbaV0gPSAkKGFuc3dlcnNEaXNwbGF5ZWRbaV0pLmZpbmQoJy5oNXAtbXVsdGljaG9pY2UtdGlwd3JhcCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUaG9zZSB0d28gbG9vcHMgY2Fubm90IGJlIG1lcmdlZCBvciB5b3UnbGwgc2NyZXcgdXAgeW91ciB0aXBzXG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFuc3dlcnNEaXNwbGF5ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8vIG1vdmUgdGlwcyBhbmQgYW5zd2VycyBvbiBkaXNwbGF5XG4gICAgICAgICAgICAkKGFuc3dlcnNEaXNwbGF5ZWRbaV0pLmZpbmQoJy5oNXAtYWx0ZXJuYXRpdmUtaW5uZXInKS5odG1sKHBhcmFtcy5hbnN3ZXJzW2ldLnRleHQpO1xuICAgICAgICAgICAgJCh0aXBbaV0pLmRldGFjaCgpLmFwcGVuZFRvKCQoYW5zd2Vyc0Rpc3BsYXllZFtpZE1hcC5pbmRleE9mKG9sZElkTWFwW2ldKV0pLmZpbmQoJy5oNXAtYWx0ZXJuYXRpdmUtY29udGFpbmVyJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgZmFsc2UsIHtcbiAgICAgICAgJ2FyaWEtbGFiZWwnOiBwYXJhbXMuVUkuYTExeVJldHJ5LFxuICAgICAgfSwge1xuICAgICAgICBjb25maXJtYXRpb25EaWFsb2c6IHtcbiAgICAgICAgICBlbmFibGU6IHBhcmFtcy5iZWhhdmlvdXIuY29uZmlybVJldHJ5RGlhbG9nLFxuICAgICAgICAgIGwxMG46IHBhcmFtcy5jb25maXJtUmV0cnksXG4gICAgICAgICAgaW5zdGFuY2U6IHNlbGYsXG4gICAgICAgICAgJHBhcmVudEVsZW1lbnQ6ICRjb250YWluZXJcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERldGVybWluZSB3aGljaCBmZWVkYmFjayB0ZXh0IHRvIGRpc3BsYXlcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29yZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgdmFyIGdldEZlZWRiYWNrVGV4dCA9IGZ1bmN0aW9uIChzY29yZSwgbWF4KSB7XG4gICAgICB2YXIgcmF0aW8gPSAoc2NvcmUgLyBtYXgpO1xuXG4gICAgICB2YXIgZmVlZGJhY2sgPSBRdWVzdGlvbi5kZXRlcm1pbmVPdmVyYWxsRmVlZGJhY2socGFyYW1zLm92ZXJhbGxGZWVkYmFjaywgcmF0aW8pO1xuXG4gICAgICByZXR1cm4gZmVlZGJhY2sucmVwbGFjZSgnQHNjb3JlJywgc2NvcmUpLnJlcGxhY2UoJ0B0b3RhbCcsIG1heCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNob3dzIGZlZWRiYWNrIG9uIHRoZSBzZWxlY3RlZCBmaWVsZHMuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3NraXBGZWVkYmFja10gU2tpcCBzaG93aW5nIGZlZWRiYWNrIGlmIHRydWVcbiAgICAgKi9cbiAgICB0aGlzLnNob3dDaGVja1NvbHV0aW9uID0gZnVuY3Rpb24gKHNraXBGZWVkYmFjaykge1xuICAgICAgdmFyIHNjb3JlUG9pbnRzO1xuICAgICAgaWYgKCEocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgfHwgcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVQb2ludCB8fCAhcGFyYW1zLmJlaGF2aW91ci5zaG93U2NvcmVQb2ludHMpKSB7XG4gICAgICAgIHNjb3JlUG9pbnRzID0gbmV3IFF1ZXN0aW9uLlNjb3JlUG9pbnRzKCk7XG4gICAgICB9XG5cbiAgICAgICRteURvbS5maW5kKCcuaDVwLWFuc3dlcicpLmVhY2goZnVuY3Rpb24gKGksIGUpIHtcbiAgICAgICAgdmFyICRlID0gJChlKTtcbiAgICAgICAgdmFyIGEgPSBwYXJhbXMuYW5zd2Vyc1tpXTtcbiAgICAgICAgdmFyIGNob3NlbiA9ICgkZS5hdHRyKCdhcmlhLWNoZWNrZWQnKSA9PT0gJ3RydWUnKTtcbiAgICAgICAgaWYgKGNob3Nlbikge1xuICAgICAgICAgIGlmIChhLmNvcnJlY3QpIHtcbiAgICAgICAgICAgIC8vIE1heSBhbHJlYWR5IGhhdmUgYmVlbiBhcHBsaWVkIGJ5IGluc3RhbnQgZmVlZGJhY2tcbiAgICAgICAgICAgIGlmICghJGUuaGFzQ2xhc3MoJ2g1cC1jb3JyZWN0JykpIHtcbiAgICAgICAgICAgICAgJGUuYWRkQ2xhc3MoJ2g1cC1jb3JyZWN0JykuYXBwZW5kKCQoJzxzcGFuLz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2g1cC1hbnN3ZXItaWNvbicsXG4gICAgICAgICAgICAgICAgaHRtbDogcGFyYW1zLlVJLmNvcnJlY3RBbnN3ZXIgKyAnLidcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghJGUuaGFzQ2xhc3MoJ2g1cC13cm9uZycpKSB7XG4gICAgICAgICAgICAgICRlLmFkZENsYXNzKCdoNXAtd3JvbmcnKS5hcHBlbmQoJCgnPHNwYW4vPicsIHtcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnaDVwLWFuc3dlci1pY29uJyxcbiAgICAgICAgICAgICAgICBodG1sOiBwYXJhbXMuVUkud3JvbmdBbnN3ZXIgKyAnLidcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzY29yZVBvaW50cykge1xuICAgICAgICAgICAgdmFyIGFsdGVybmF0aXZlQ29udGFpbmVyID0gJGVbMF0ucXVlcnlTZWxlY3RvcignLmg1cC1hbHRlcm5hdGl2ZS1jb250YWluZXInKTtcblxuICAgICAgICAgICAgaWYgKCFwYXJhbXMuYmVoYXZpb3VyLmF1dG9DaGVjayB8fCBhbHRlcm5hdGl2ZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuaDVwLXF1ZXN0aW9uLXBsdXMtb25lLCAuaDVwLXF1ZXN0aW9uLW1pbnVzLW9uZScpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIGFsdGVybmF0aXZlQ29udGFpbmVyLmFwcGVuZENoaWxkKHNjb3JlUG9pbnRzLmdldEVsZW1lbnQoYS5jb3JyZWN0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFza2lwRmVlZGJhY2spIHtcbiAgICAgICAgICBpZiAoY2hvc2VuICYmIGEudGlwc0FuZEZlZWRiYWNrLmNob3NlbkZlZWRiYWNrICE9PSB1bmRlZmluZWQgJiYgYS50aXBzQW5kRmVlZGJhY2suY2hvc2VuRmVlZGJhY2sgIT09ICcnKSB7XG4gICAgICAgICAgICBhZGRGZWVkYmFjaygkZSwgYS50aXBzQW5kRmVlZGJhY2suY2hvc2VuRmVlZGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICghY2hvc2VuICYmIGEudGlwc0FuZEZlZWRiYWNrLm5vdENob3NlbkZlZWRiYWNrICE9PSB1bmRlZmluZWQgJiYgYS50aXBzQW5kRmVlZGJhY2subm90Q2hvc2VuRmVlZGJhY2sgIT09ICcnKSB7XG4gICAgICAgICAgICBhZGRGZWVkYmFjaygkZSwgYS50aXBzQW5kRmVlZGJhY2subm90Q2hvc2VuRmVlZGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIERldGVybWluZSBmZWVkYmFja1xuICAgICAgdmFyIG1heCA9IHNlbGYuZ2V0TWF4U2NvcmUoKTtcblxuICAgICAgLy8gRGlzYWJsZSB0YXNrIGlmIG1heHNjb3JlIGlzIGFjaGlldmVkXG4gICAgICB2YXIgZnVsbFNjb3JlID0gKHNjb3JlID09PSBtYXgpO1xuXG4gICAgICBpZiAoZnVsbFNjb3JlKSB7XG4gICAgICAgIHNlbGYuaGlkZUJ1dHRvbignY2hlY2stYW5zd2VyJyk7XG4gICAgICAgIHNlbGYuaGlkZUJ1dHRvbigndHJ5LWFnYWluJyk7XG4gICAgICAgIHNlbGYuaGlkZUJ1dHRvbignc2hvdy1zb2x1dGlvbicpO1xuICAgICAgfVxuXG4gICAgICAvLyBTaG93IGZlZWRiYWNrXG4gICAgICBpZiAoIXNraXBGZWVkYmFjaykge1xuICAgICAgICB0aGlzLnNldEZlZWRiYWNrKGdldEZlZWRiYWNrVGV4dChzY29yZSwgbWF4KSwgc2NvcmUsIG1heCwgcGFyYW1zLlVJLnNjb3JlQmFyTGFiZWwpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlcyBjaG9vc2luZyBuZXcgaW5wdXQuXG4gICAgICovXG4gICAgdmFyIGRpc2FibGVJbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJy5oNXAtYW5zd2VyJywgJG15RG9tKS5hdHRyKHtcbiAgICAgICAgJ2FyaWEtZGlzYWJsZWQnOiAndHJ1ZScsXG4gICAgICAgICd0YWJpbmRleCc6ICctMSdcbiAgICAgIH0pLnJlbW92ZUF0dHIoJ3JvbGUnKVxuICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1jaGVja2VkJyk7XG5cbiAgICAgICQoJy5oNXAtYW5zd2VycycpLnJlbW92ZUF0dHIoJ3JvbGUnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBuZXcgaW5wdXQuXG4gICAgICovXG4gICAgdmFyIGVuYWJsZUlucHV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJCgnLmg1cC1hbnN3ZXInLCAkbXlEb20pXG4gICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAnYXJpYS1kaXNhYmxlZCc6ICdmYWxzZScsXG4gICAgICAgICAgJ3JvbGUnOiBwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciA/ICdyYWRpbycgOiAnY2hlY2tib3gnLFxuICAgICAgICB9KTtcblxuICAgICAgJCgnLmg1cC1hbnN3ZXJzJykuYXR0cigncm9sZScsIHBhcmFtcy5yb2xlKTtcbiAgICB9O1xuXG4gICAgdmFyIGNhbGNTY29yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNjb3JlID0gMDtcbiAgICAgIGZvciAoY29uc3QgYW5zd2VyIG9mIHBhcmFtcy51c2VyQW5zd2Vycykge1xuICAgICAgICBjb25zdCBjaG9pY2UgPSBwYXJhbXMuYW5zd2Vyc1thbnN3ZXJdO1xuICAgICAgICBjb25zdCB3ZWlnaHQgPSAoY2hvaWNlLndlaWdodCAhPT0gdW5kZWZpbmVkID8gY2hvaWNlLndlaWdodCA6IDEpO1xuICAgICAgICBpZiAoY2hvaWNlLmNvcnJlY3QpIHtcbiAgICAgICAgICBzY29yZSArPSB3ZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2NvcmUgLT0gd2VpZ2h0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc2NvcmUgPCAwKSB7XG4gICAgICAgIHNjb3JlID0gMDtcbiAgICAgIH1cbiAgICAgIGlmICghcGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aCAmJiBibGFua0lzQ29ycmVjdCkge1xuICAgICAgICBzY29yZSA9IHBhcmFtcy53ZWlnaHQ7XG4gICAgICB9XG4gICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVQb2ludCkge1xuICAgICAgICBzY29yZSA9ICgxMDAgKiBzY29yZSAvIGNhbGN1bGF0ZU1heFNjb3JlKCkpID49IHBhcmFtcy5iZWhhdmlvdXIucGFzc1BlcmNlbnRhZ2UgPyBwYXJhbXMud2VpZ2h0IDogMDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBzZWxlY3Rpb25zIGZyb20gdGFzay5cbiAgICAgKi9cbiAgICB2YXIgcmVtb3ZlU2VsZWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkYW5zd2VycyA9ICQoJy5oNXAtYW5zd2VyJywgJG15RG9tKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2g1cC1zZWxlY3RlZCcpXG4gICAgICAgIC5hdHRyKCdhcmlhLWNoZWNrZWQnLCAnZmFsc2UnKTtcblxuICAgICAgaWYgKCFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAkYW5zd2Vycy5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJGFuc3dlcnMuZmlyc3QoKS5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBmb2N1cyB0byBmaXJzdCBvcHRpb25cbiAgICAgICRhbnN3ZXJzLmZpcnN0KCkuZm9jdXMoKTtcblxuICAgICAgY2FsY1Njb3JlKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldCB4QVBJIGRhdGEuXG4gICAgICogQ29udHJhY3QgdXNlZCBieSByZXBvcnQgcmVuZGVyaW5nIGVuZ2luZS5cbiAgICAgKlxuICAgICAqIEBzZWUgY29udHJhY3QgYXQge0BsaW5rIGh0dHBzOi8vaDVwLm9yZy9kb2N1bWVudGF0aW9uL2RldmVsb3BlcnMvY29udHJhY3RzI2d1aWRlcy1oZWFkZXItNn1cbiAgICAgKi9cbiAgICB0aGlzLmdldFhBUElEYXRhID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHhBUElFdmVudCA9IHRoaXMuY3JlYXRlWEFQSUV2ZW50VGVtcGxhdGUoJ2Fuc3dlcmVkJyk7XG4gICAgICBhZGRRdWVzdGlvblRvWEFQSSh4QVBJRXZlbnQpO1xuICAgICAgYWRkUmVzcG9uc2VUb1hBUEkoeEFQSUV2ZW50KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXRlbWVudDogeEFQSUV2ZW50LmRhdGEuc3RhdGVtZW50XG4gICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGQgdGhlIHF1ZXN0aW9uIGl0c2VsZiB0byB0aGUgZGVmaW5pdGlvbiBwYXJ0IG9mIGFuIHhBUElFdmVudFxuICAgICAqL1xuICAgIHZhciBhZGRRdWVzdGlvblRvWEFQSSA9IGZ1bmN0aW9uICh4QVBJRXZlbnQpIHtcbiAgICAgIHZhciBkZWZpbml0aW9uID0geEFQSUV2ZW50LmdldFZlcmlmaWVkU3RhdGVtZW50VmFsdWUoWydvYmplY3QnLCAnZGVmaW5pdGlvbiddKTtcbiAgICAgIGRlZmluaXRpb24uZGVzY3JpcHRpb24gPSB7XG4gICAgICAgIC8vIFJlbW92ZSB0YWdzLCBtdXN0IHdyYXAgaW4gZGl2IHRhZyBiZWNhdXNlIGpRdWVyeSAxLjkgd2lsbCBjcmFzaCBpZiB0aGUgc3RyaW5nIGlzbid0IHdyYXBwZWQgaW4gYSB0YWcuXG4gICAgICAgICdlbi1VUyc6ICQoJzxkaXY+JyArIHBhcmFtcy5xdWVzdGlvbiArICc8L2Rpdj4nKS50ZXh0KClcbiAgICAgIH07XG4gICAgICBkZWZpbml0aW9uLnR5cGUgPSAnaHR0cDovL2FkbG5ldC5nb3YvZXhwYXBpL2FjdGl2aXRpZXMvY21pLmludGVyYWN0aW9uJztcbiAgICAgIGRlZmluaXRpb24uaW50ZXJhY3Rpb25UeXBlID0gJ2Nob2ljZSc7XG4gICAgICBkZWZpbml0aW9uLmNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuID0gW107XG4gICAgICBkZWZpbml0aW9uLmNob2ljZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVmaW5pdGlvbi5jaG9pY2VzW2ldID0ge1xuICAgICAgICAgICdpZCc6IHBhcmFtcy5hbnN3ZXJzW2ldLm9yaWdpbmFsT3JkZXIgKyAnJyxcbiAgICAgICAgICAnZGVzY3JpcHRpb24nOiB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGFncywgbXVzdCB3cmFwIGluIGRpdiB0YWcgYmVjYXVzZSBqUXVlcnkgMS45IHdpbGwgY3Jhc2ggaWYgdGhlIHN0cmluZyBpc24ndCB3cmFwcGVkIGluIGEgdGFnLlxuICAgICAgICAgICAgJ2VuLVVTJzogJCgnPGRpdj4nICsgcGFyYW1zLmFuc3dlcnNbaV0udGV4dCArICc8L2Rpdj4nKS50ZXh0KClcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChwYXJhbXMuYW5zd2Vyc1tpXS5jb3JyZWN0KSB7XG4gICAgICAgICAgaWYgKCFwYXJhbXMuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVybi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVyblswXSArPSAnWyxdJztcbiAgICAgICAgICAgICAgLy8gVGhpcyBsb29rcyBpbnNhbmUsIGJ1dCBpdCdzIGhvdyB5b3Ugc2VwYXJhdGUgbXVsdGlwbGUgYW5zd2Vyc1xuICAgICAgICAgICAgICAvLyB0aGF0IG11c3QgYWxsIGJlIGNob3NlbiB0byBhY2hpZXZlIHBlcmZlY3Qgc2NvcmUuLi5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBkZWZpbml0aW9uLmNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuLnB1c2goJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVyblswXSArPSBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm4ucHVzaCgnJyArIHBhcmFtcy5hbnN3ZXJzW2ldLm9yaWdpbmFsT3JkZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGQgdGhlIHJlc3BvbnNlIHBhcnQgdG8gYW4geEFQSSBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHtYQVBJRXZlbnR9IHhBUElFdmVudFxuICAgICAqICBUaGUgeEFQSSBldmVudCB3ZSB3aWxsIGFkZCBhIHJlc3BvbnNlIHRvXG4gICAgICovXG4gICAgdmFyIGFkZFJlc3BvbnNlVG9YQVBJID0gZnVuY3Rpb24gKHhBUElFdmVudCkge1xuICAgICAgdmFyIG1heFNjb3JlID0gc2VsZi5nZXRNYXhTY29yZSgpO1xuICAgICAgdmFyIHN1Y2Nlc3MgPSAoMTAwICogc2NvcmUgLyBtYXhTY29yZSkgPj0gcGFyYW1zLmJlaGF2aW91ci5wYXNzUGVyY2VudGFnZTtcblxuICAgICAgeEFQSUV2ZW50LnNldFNjb3JlZFJlc3VsdChzY29yZSwgbWF4U2NvcmUsIHNlbGYsIHRydWUsIHN1Y2Nlc3MpO1xuICAgICAgaWYgKHBhcmFtcy51c2VyQW5zd2VycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNhbGNTY29yZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2UgPSAnJztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyZXNwb25zZSAhPT0gJycpIHtcbiAgICAgICAgICByZXNwb25zZSArPSAnWyxdJztcbiAgICAgICAgfVxuICAgICAgICByZXNwb25zZSArPSBpZE1hcCA9PT0gdW5kZWZpbmVkID8gcGFyYW1zLnVzZXJBbnN3ZXJzW2ldIDogaWRNYXBbcGFyYW1zLnVzZXJBbnN3ZXJzW2ldXTtcbiAgICAgIH1cbiAgICAgIHhBUElFdmVudC5kYXRhLnN0YXRlbWVudC5yZXN1bHQucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbWFwIHBvaW50aW5nIGZyb20gb3JpZ2luYWwgYW5zd2VycyB0byBzaHVmZmxlZCBhbnN3ZXJzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJbXX0gbWFwIHBvaW50aW5nIGZyb20gb3JpZ2luYWwgYW5zd2VycyB0byBzaHVmZmxlZCBhbnN3ZXJzXG4gICAgICovXG4gICAgdmFyIGdldFNodWZmbGVNYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBwYXJhbXMuYW5zd2VycyA9IHNodWZmbGVBcnJheShwYXJhbXMuYW5zd2Vycyk7XG5cbiAgICAgIC8vIENyZWF0ZSBhIG1hcCBmcm9tIHRoZSBuZXcgaWQgdG8gdGhlIG9sZCBvbmVcbiAgICAgIHZhciBpZE1hcCA9IFtdO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlkTWFwW2ldID0gcGFyYW1zLmFuc3dlcnNbaV0ub3JpZ2luYWxPcmRlcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpZE1hcDtcbiAgICB9O1xuXG4gICAgLy8gSW5pdGlhbGl6YXRpb24gY29kZVxuICAgIC8vIFJhbmRvbWl6ZSBvcmRlciwgaWYgcmVxdWVzdGVkXG4gICAgdmFyIGlkTWFwO1xuICAgIC8vIFN0b3JlIG9yaWdpbmFsIG9yZGVyIGluIGFuc3dlcnNcbiAgICBmb3IgKGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhcmFtcy5hbnN3ZXJzW2ldLm9yaWdpbmFsT3JkZXIgPSBpO1xuICAgIH1cbiAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5yYW5kb21BbnN3ZXJzKSB7XG4gICAgICBpZE1hcCA9IGdldFNodWZmbGVNYXAoKTtcbiAgICB9XG5cbiAgICAvLyBTdGFydCB3aXRoIGFuIGVtcHR5IHNldCBvZiB1c2VyIGFuc3dlcnMuXG4gICAgcGFyYW1zLnVzZXJBbnN3ZXJzID0gW107XG5cbiAgICAvLyBSZXN0b3JlIHByZXZpb3VzIHN0YXRlXG4gICAgaWYgKGNvbnRlbnREYXRhICYmIGNvbnRlbnREYXRhLnByZXZpb3VzU3RhdGUgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAvLyBSZXN0b3JlIGFuc3dlcnNcbiAgICAgIGlmIChjb250ZW50RGF0YS5wcmV2aW91c1N0YXRlLmFuc3dlcnMpIHtcbiAgICAgICAgaWYgKCFpZE1hcCkge1xuICAgICAgICAgIHBhcmFtcy51c2VyQW5zd2VycyA9IGNvbnRlbnREYXRhLnByZXZpb3VzU3RhdGUuYW5zd2VycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBUaGUgYW5zd2VycyBoYXZlIGJlZW4gc2h1ZmZsZWQsIGFuZCB3ZSBtdXN0IHVzZSB0aGUgaWQgbWFwcGluZy5cbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29udGVudERhdGEucHJldmlvdXNTdGF0ZS5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGlkTWFwLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgIGlmIChpZE1hcFtrXSA9PT0gY29udGVudERhdGEucHJldmlvdXNTdGF0ZS5hbnN3ZXJzW2ldKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzLnB1c2goayk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2FsY1Njb3JlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhhc0NoZWNrZWRBbnN3ZXIgPSBmYWxzZTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBjaG9pY2VzXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIGFucyA9IHBhcmFtcy5hbnN3ZXJzW2pdO1xuXG4gICAgICBpZiAoIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgIC8vIFNldCByb2xlXG4gICAgICAgIGFucy5yb2xlID0gJ2NoZWNrYm94JztcbiAgICAgICAgYW5zLnRhYmluZGV4ID0gJzAnO1xuICAgICAgICBpZiAocGFyYW1zLnVzZXJBbnN3ZXJzLmluZGV4T2YoaikgIT09IC0xKSB7XG4gICAgICAgICAgYW5zLmNoZWNrZWQgPSAndHJ1ZSc7XG4gICAgICAgICAgaGFzQ2hlY2tlZEFuc3dlciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBTZXQgcm9sZVxuICAgICAgICBhbnMucm9sZSA9ICdyYWRpbyc7XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRhYmluZGV4LCBjaGVja2VkIGFuZCBleHRyYSBjbGFzc2VzXG4gICAgICAgIGlmIChwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgLy8gTm8gY29ycmVjdCBhbnN3ZXJzXG4gICAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gcGFyYW1zLmFuc3dlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbnMudGFiaW5kZXggPSAnMCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBhcmFtcy51c2VyQW5zd2Vycy5pbmRleE9mKGopICE9PSAtMSkge1xuICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNvcnJlY3QgY2hvaWNlXG4gICAgICAgICAgYW5zLnRhYmluZGV4ID0gJzAnO1xuICAgICAgICAgIGFucy5jaGVja2VkID0gJ3RydWUnO1xuICAgICAgICAgIGhhc0NoZWNrZWRBbnN3ZXIgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBkZWZhdWx0XG4gICAgICBpZiAoYW5zLnRhYmluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYW5zLnRhYmluZGV4ID0gJy0xJztcbiAgICAgIH1cbiAgICAgIGlmIChhbnMuY2hlY2tlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFucy5jaGVja2VkID0gJ2ZhbHNlJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UuY291bnRlciA9IChNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UuY291bnRlciA9PT0gdW5kZWZpbmVkID8gMCA6IE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5jb3VudGVyICsgMSk7XG4gICAgcGFyYW1zLnJvbGUgPSAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPyAncmFkaW9ncm91cCcgOiAnZ3JvdXAnKTtcbiAgICBwYXJhbXMubGFiZWxJZCA9ICdoNXAtbWNxJyArIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5jb3VudGVyO1xuXG4gICAgLyoqXG4gICAgICogUGFjayB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgaW50ZXJhY3Rpdml0eSBpbnRvIGEgb2JqZWN0IHRoYXQgY2FuIGJlXG4gICAgICogc2VyaWFsaXplZC5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICB0aGlzLmdldEN1cnJlbnRTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHt9O1xuICAgICAgaWYgKCFpZE1hcCkge1xuICAgICAgICBzdGF0ZS5hbnN3ZXJzID0gcGFyYW1zLnVzZXJBbnN3ZXJzO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIFRoZSBhbnN3ZXJzIGhhdmUgYmVlbiBzaHVmZmxlZCBhbmQgbXVzdCBiZSBtYXBwZWQgYmFjayB0byB0aGVpclxuICAgICAgICAvLyBvcmlnaW5hbCBJRC5cbiAgICAgICAgc3RhdGUuYW5zd2VycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHN0YXRlLmFuc3dlcnMucHVzaChpZE1hcFtwYXJhbXMudXNlckFuc3dlcnNbaV1dKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGhhcyBnaXZlbiBhbiBhbnN3ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpZ25vcmVDaGVja10gSWdub3JlIHJldHVybmluZyB0cnVlIGZyb20gcHJlc3NpbmcgXCJjaGVjay1hbnN3ZXJcIiBidXR0b24uXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiBhbnN3ZXIgaXMgZ2l2ZW5cbiAgICAgKi9cbiAgICB0aGlzLmdldEFuc3dlckdpdmVuID0gZnVuY3Rpb24gKGlnbm9yZUNoZWNrKSB7XG4gICAgICB2YXIgYW5zd2VyZWQgPSBpZ25vcmVDaGVjayA/IGZhbHNlIDogdGhpcy5hbnN3ZXJlZDtcbiAgICAgIHJldHVybiBhbnN3ZXJlZCB8fCBwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoID4gMCB8fCBibGFua0lzQ29ycmVjdDtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRTY29yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzY29yZTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBINVAuY3JlYXRlVGl0bGUoKHRoaXMuY29udGVudERhdGEgJiYgdGhpcy5jb250ZW50RGF0YS5tZXRhZGF0YSAmJiB0aGlzLmNvbnRlbnREYXRhLm1ldGFkYXRhLnRpdGxlKSA/IHRoaXMuY29udGVudERhdGEubWV0YWRhdGEudGl0bGUgOiAnTXVsdGlwbGUgQ2hvaWNlJyk7XG4gICAgfTtcblxuICAgICQoc2VsZi5sb2FkT2JzZXJ2ZXJzKHBhcmFtcykpXG5cbiAgfTtcblxuICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShRdWVzdGlvbi5wcm90b3R5cGUpO1xuICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlO1xuXG4gIGZ1bmN0aW9uIHNhbml0aXplWE1MU3RyaW5nKHhtbCkge1xuICAgIHJldHVybiB4bWwucmVwbGFjZSgvJmFtcDsvZywgXCImXCIpLnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLyZsdDsvZywgXCI8XCIpLnJlcGxhY2UoLyZxdW90Oy9nLCBcIlxcXCJcIik7XG4gIH1cblxuICAvKipcbiAgKiBOb3RhdGlvbiBsb2dpY1xuICAqL1xuXG4gIC8qKlxuICAqIExvYWQgb2Jlc2VydmVycyBmb3IgY2hhbmdlcyBpbiB0aGUgZG9tLCBzbyB0aGF0IHBhcmFtZXRlcnMgb2YgdGhlIHZpYmUgY2FuIGJlIHVwZGF0ZWQgXG4gICovXG4gIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5wcm90b3R5cGUubG9hZE9ic2VydmVycyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB0aGlzLmluc3RhbmNlUGFzc2VkID0gZmFsc2VcbiAgICAvLyBkbyBhbGwgdGhlIGltcG9ydGFudCB2aWJlIHN0dWZmLCB3aGVuIHZpYmUgaXMgcHJvcGVybHkgbG9hZGVkIGFuZCBhdHRhY2hlZFxuICAgIHZhciBkb21BdHRhY2hPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtdXRhdGlvbikge1xuICAgICAgICBBcnJheS5mcm9tKG11dGF0aW9uLmFkZGVkTm9kZXMpLmZvckVhY2goYW4gPT4ge1xuICAgICAgICAgIGlmIChhbi5jb25zdHJ1Y3Rvci5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJlbGVtZW50XCIpKSB7XG4gICAgICAgICAgICBpZiAoYW4uY2xhc3NMaXN0LmNvbnRhaW5zKFwiaDVwLXF1ZXN0aW9uLWNvbnRlbnRcIikgJiYgYW4ucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJoNXAtbXVsdGljaG9pY2VcIikpIHtcbiAgICAgICAgICAgICAgaWYgKGFuLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5oNXAtdmliZS1jb250YWluZXJcIikgPT09IG51bGwgJiYgIXRoYXQuaW5zdGFuY2VQYXNzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lmluc3RhbmNlUGFzc2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHZhciB2aWJlQ29udGFpbmVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICAgICAgICAgIHZpYmVDb250YWluZXJEaXYuY2xhc3NMaXN0LmFkZChcImg1cC12aWJlLWNvbnRhaW5lclwiKVxuICAgICAgICAgICAgICAgIGFuLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHZpYmVDb250YWluZXJEaXYsIGFuKVxuICAgICAgICAgICAgICAgIHRoYXQubG9hZFNWRyhwYXJhbXMpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW4uY2xhc3NMaXN0LmNvbnRhaW5zKFwibm90YXRpb25cIikpIHtcbiAgICAgICAgICAgICAgdGhhdC5hZGp1c3RGcmFtZShhbilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRvbUF0dGFjaE9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHtcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgIHN1YnRyZWU6IHRydWVcbiAgICB9KTtcbiAgfVxuXG5cblxuICAvKipcbiAgICogTG9hZHMgU1ZHIGZyb20gcGFyYW1ldGVyc1xuICAgKiBwYXJhbXMgbXVzdCBjb250YWluOlxuICAgKiAtIHBhcmFtcy5xdWVzdGlvbl9ub3RhdGlvbl9saXN0XG4gICAqIC0gcGFyYW1zLmFuc3dlcnNbaV0uYW5zd2VyX25vdGF0aW9uXG4gICAqIEBwYXJhbSB7Kn0gcGFyYW1zIFxuICAgKi9cbiAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLnByb3RvdHlwZS5sb2FkU1ZHID0gYXN5bmMgZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgdmFyIHJvb3RDb250YWluZXJcbiAgICBpZiAocGFyYW1zLnF1ZXN0aW9uX2luc3RhbmNlX251bSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHJvb3RDb250YWluZXIgPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5xdWVzdGlvbi1jb250YWluZXJcIilbcGFyYW1zLnF1ZXN0aW9uX2luc3RhbmNlX251bV1cbiAgICAgIGlmIChyb290Q29udGFpbmVyLmdldEF0dHJpYnV0ZShcImluc3RhbmNlLWlkXCIpID09PSBudWxsKSB7XG4gICAgICAgIHJvb3RDb250YWluZXIuc2V0QXR0cmlidXRlKFwiaW5zdGFuY2UtaWRcIiwgcGFyYW1zLnF1ZXN0aW9uX2luc3RhbmNlX251bSlcbiAgICAgICAgLy8gdGhhdC5hY3RpdmVRdWVzdGlvbkNvbnRhaW5lck9ic2VydmVyLm9ic2VydmUocm9vdENvbnRhaW5lciwge1xuICAgICAgICAvLyAgIGF0dHJpYnV0ZXM6IHRydWVcbiAgICAgICAgLy8gfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vaWYocm9vdENvbnRhaW5lci5nZXRBdHRyaWJ1dGUoXCJpbnN0YW5jZS1pZFwiKSA9PSBwYXJhbXMucXVlc3Rpb25faW5zdGFuY2VfbnVtKSByZXR1cm5cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcm9vdENvbnRhaW5lciA9IHdpbmRvdy5kb2N1bWVudC5ib2R5XG4gICAgfVxuXG4gICAgdmFyIHF1ZXN0aW9uX2NvbnRhaW5lciA9IHJvb3RDb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5oNXAtdmliZS1jb250YWluZXJcIilcbiAgICAvL3RoaXMgd2lsbCBwcmV2ZW50IGxvYWRpbmcgbm9uIHZpc2libGUgY29udGFpbmVycyAoZS5nLiBpbiBxdWVzdGlvbiBzZXQsIHZpYmUtY29udGFpbmVycyB3aWxsIGFwcGVhciBvbiBkaWZmZXJlbnQgc2xpZGVzKVxuICAgIC8vIGlmIChyb290Q29udGFpbmVyLmNsb3Nlc3QoXCIucXVlc3Rpb24tY29udGFpbmVyW3N0eWxlPSdkaXNwbGF5OiBub25lOydcIikgIT09IG51bGwpIHJldHVyblxuICAgIC8vIGlmIChyb290Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIudmliZS1jb250YWluZXJcIikgIT09IG51bGwpIHJldHVyblxuICAgIGlmIChwYXJhbXMucXVlc3Rpb25fbm90YXRpb25fbGlzdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLnF1ZXN0aW9uX25vdGF0aW9uX2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFwYXJhbXMucXVlc3Rpb25fbm90YXRpb25fbGlzdFtpXS5ub3RhdGlvbldpZGdldC5pbmNsdWRlcyhcIiZsdDsvc3ZnXCIpKSBjb250aW51ZSAvLyBUaGUgYm94IGZvciB0aGUgbm90YXRpb24gaXMgaW5pdGlhbGl6ZWQgYnV0IGl0IGhhcyBubyBwYXJzYWJsZSBzdHJpbmcuIEp1c3QgY2hlY2tpbmcgaWYgc3ZnIHRhZyBleGlzdHNcbiAgICAgICAgdmFyICR2aWJlUXVlc3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgICR2aWJlUXVlc3Rpb24uc2V0QXR0cmlidXRlKFwiaWRcIiwgJ3ZpYmVDaG9pY2UnICsgdGhpcy5nZW5lcmF0ZVVJRCgpKVxuICAgICAgICAkdmliZVF1ZXN0aW9uLmNsYXNzTGlzdC5hZGQoXCJub3RhdGlvblwiKVxuICAgICAgICB2YXIgc3Znb3V0ID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhzYW5pdGl6ZVhNTFN0cmluZyhwYXJhbXMucXVlc3Rpb25fbm90YXRpb25fbGlzdFtpXS5ub3RhdGlvbldpZGdldCksIFwidGV4dC9odG1sXCIpLmJvZHkuZmlyc3RDaGlsZFxuICAgICAgICBzdmdvdXQucXVlcnlTZWxlY3RvckFsbChcIiNtYW5pcHVsYXRvckNhbnZhcywgI3Njb3JlUmVjdHMsICNsYWJlbENhbnZhcywgI3BoYW50b21DYW52YXNcIikuZm9yRWFjaChjID0+IGMucmVtb3ZlKCkpXG4gICAgICAgIHN2Z291dCA9IHN2Z291dC5xdWVyeVNlbGVjdG9yKFwiI3N2Z0NvbnRhaW5lclwiKVxuICAgICAgICBzdmdvdXQucXVlcnlTZWxlY3RvckFsbChcIi5tYXJrZWQsIC5sYXN0QWRkZWRcIikuZm9yRWFjaChtID0+IHtcbiAgICAgICAgICBtLmNsYXNzTGlzdC5yZW1vdmUoXCJtYXJrZWRcIilcbiAgICAgICAgICBtLmNsYXNzTGlzdC5yZW1vdmUoXCJsYXN0QWRkZWRcIilcbiAgICAgICAgfSlcbiAgICAgICAgLy9zdmdvdXQucXVlcnlTZWxlY3RvckFsbChcInN2Z1wiKS5mb3JFYWNoKHN2ZyA9PiBzdmcuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZSgyLjUpXCIpXG4gICAgICAgICR2aWJlUXVlc3Rpb24uYXBwZW5kKHN2Z291dClcbiAgICAgICAgcXVlc3Rpb25fY29udGFpbmVyLmFwcGVuZENoaWxkKCR2aWJlUXVlc3Rpb24pXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHBhcmFtcy5hbnN3ZXJzW2ldLmFuc3dlcl9ub3RhdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRW1wdHlNRUkocGFyYW1zLmFuc3dlcnNbaV0uYW5zd2VyX25vdGF0aW9uLm5vdGF0aW9uV2lkZ2V0KSkge1xuICAgICAgICAgIHZhciB1dWlkID0gdGhpcy5nZW5lcmF0ZVVJRCgpXG4gICAgICAgICAgdmFyICR2aWJlQW5zd2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICAgICR2aWJlQW5zd2VyLnNldEF0dHJpYnV0ZShcImlkXCIsICd2aWJlQW5zd2VyJyArIHV1aWQpXG4gICAgICAgICAgJHZpYmVBbnN3ZXIuY2xhc3NMaXN0LmFkZChcIm5vdGF0aW9uXCIpXG4gICAgICAgICAgdmFyIGFuc3dlckNvbnRhaW5lciA9IHJvb3RDb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5oNXAtYWx0ZXJuYXRpdmUtY29udGFpbmVyW2Fuc3dlci1pZD0nXCIgKyBpLnRvU3RyaW5nKCkgKyBcIidcIilcbiAgICAgICAgICB2YXIgc3Znb3V0ID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhzYW5pdGl6ZVhNTFN0cmluZyhwYXJhbXMuYW5zd2Vyc1tpXS5hbnN3ZXJfbm90YXRpb24ubm90YXRpb25XaWRnZXQpLCBcInRleHQvaHRtbFwiKS5ib2R5LmZpcnN0Q2hpbGRcbiAgICAgICAgICBzdmdvdXQucXVlcnlTZWxlY3RvckFsbChcIiNtYW5pcHVsYXRvckNhbnZhcywgI3Njb3JlUmVjdHMsICNsYWJlbENhbnZhcywgI3BoYW50b21DYW52YXNcIikuZm9yRWFjaChjID0+IGMucmVtb3ZlKCkpXG4gICAgICAgICAgc3Znb3V0ID0gc3Znb3V0LnF1ZXJ5U2VsZWN0b3IoXCIjc3ZnQ29udGFpbmVyXCIpXG4gICAgICAgICAgc3Znb3V0LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWFya2VkLCAubGFzdEFkZGVkXCIpLmZvckVhY2gobSA9PiB7XG4gICAgICAgICAgICBtLmNsYXNzTGlzdC5yZW1vdmUoXCJtYXJrZWRcIilcbiAgICAgICAgICAgIG0uY2xhc3NMaXN0LnJlbW92ZShcImxhc3RBZGRlZFwiKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy9zdmdvdXQucXVlcnlTZWxlY3RvckFsbChcInN2Z1wiKS5mb3JFYWNoKHN2ZyA9PiBzdmcuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZSgyLjUpXCIpXG4gICAgICAgICAgJHZpYmVBbnN3ZXIuYXBwZW5kKHN2Z291dClcbiAgICAgICAgICBhbnN3ZXJDb250YWluZXIuYXBwZW5kQ2hpbGQoJHZpYmVBbnN3ZXIpXG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZpYmVJbnN0YW5jZXNcbiAgfVxuXG4gIC8qKlxuICAgICAqIEFkanVzdCBzaXplcyBhY2NvcmRpbmcgdG8gZGVmaW5pdGlvbi1zY2FsZSBoZWlnaHQgb2YgY29udGVudHMgd2hlbiBhbGwgbmVjZXNzYXJ5IGNvbnRhaW5lcnMgYXJlIGxvYWRlZC5cbiAgICAgKi9cbiAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLnByb3RvdHlwZS5hZGp1c3RGcmFtZSA9IGZ1bmN0aW9uICh2aWJlQ29udGFpbmVyKSB7XG5cbiAgICB2YXIgY29udGFpbmVyU1ZHID0gdmliZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiI3N2Z0NvbnRhaW5lclwiKVxuICAgIGlmIChjb250YWluZXJTVkcgIT09IG51bGwpIHtcbiAgICAgIC8vIHZhciB2YiA9IGNvbnRhaW5lclNWRy5xdWVyeVNlbGVjdG9yKFwiI2ludGVyYWN0aW9uT3ZlcmxheVwiKS5nZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIpPy5zcGxpdChcIiBcIikubWFwKHBhcnNlRmxvYXQpXG4gICAgICAvLyBjb250YWluZXJIZWlnaHQgPSAodmJbM10gKiAxLjI1KS50b1N0cmluZygpICsgXCJweFwiXG4gICAgICAvLyBjb250YWluZXJTVkcuc3R5bGUub3ZlcmZsb3cgPSBcImF1dG9cIlxuXG4gICAgICBpZiAodGhpcy50YXNrQ29udGFpbmVySGVpZ2h0ID09PSAwKSB7XG4gICAgICAgIEFycmF5LmZyb20oY29udGFpbmVyU1ZHLmNoaWxkcmVuKS5mb3JFYWNoKGMgPT4ge1xuICAgICAgICAgIGlmIChjLmlkID09PSBcInNpZGViYXJDb250YWluZXJcIikgcmV0dXJuXG4gICAgICAgICAgaWYoYy5pZCA9PT0gXCJpbnRlcmFjdGlvbk92ZXJsYXlcIil7XG4gICAgICAgICAgICBpZihBcnJheS5mcm9tKGMuY2hpbGRyZW4pLmV2ZXJ5KGNoaWxkID0+IGNoaWxkLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkpIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnRhc2tDb250YWluZXJIZWlnaHQgKz0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgdmliZUNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAodGhpcy50YXNrQ29udGFpbmVySGVpZ2h0ICogMS4zKSArIFwicHhcIiAvL2NvbnRhaW5lckhlaWdodCB8fCBcIjIwcmVtXCJcbiAgICB2aWJlQ29udGFpbmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCJcblxuXG4gICAgLy8gdmFyIGg1cENvbnRhaW5lciA9IHZpYmVDb250YWluZXIucGFyZW50RWxlbWVudCAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaDVwLXZpYmUtY29udGFpbmVyXCIpXG4gICAgLy8gdmFyIHNob3dDaGlsZHJlbiA9IGg1cENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLnZpYmUtY29udGFpbmVyXCIpXG4gICAgLy8gdmFyIGg1cENvbnRhaW5lckhlaWdodCA9IHBhcnNlRmxvYXQoaDVwQ29udGFpbmVyLnN0eWxlLmhlaWd0aCkgfHwgMFxuICAgIC8vIHNob3dDaGlsZHJlbi5mb3JFYWNoKHNjID0+IHtcbiAgICAvLyAgIGg1cENvbnRhaW5lckhlaWdodCArPSBzYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHRcbiAgICAvLyAgIHNjLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiIC8vIHZlcnkgaW1wb3J0YW50LCBzbyB0aGF0IHRoZSBjb250YWluZXJzIGFyZSBkaXNwbGF5ZWQgaW4gdGhlIHNhbWUgY29sdW1uXG4gICAgLy8gfSlcbiAgICAvLyBoNXBDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gaDVwQ29udGFpbmVySGVpZ2h0LnRvU3RyaW5nKCkgKyBcInB4XCJcbiAgICAvLyB3aW5kb3cuZnJhbWVFbGVtZW50LnN0eWxlLmhlaWdodCA9IChwYXJzZUZsb2F0KHdpbmRvdy5mcmFtZUVsZW1lbnQuc3R5bGUuaGVpZ2h0KSArIGg1cENvbnRhaW5lckhlaWdodCAvIDEpLnRvU3RyaW5nKCkgKyBcInB4XCJcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBnaXZlbiBNRUkgaXMganVzdCBlbXB0eS5cbiAgICogRW1wdHkgbWVhbnM6IE9ubHkgb25lIGxheWVyIHdpdGggb25lIG1SZXN0LiBUaGlzIGlzIHRoZSBkZWZhdWx0IG5vdGF0aW9uIHNldHVwIHdpdGhvdXQgY2hhbmdpbmcgYW55dGhpbmcuXG4gICAqIEBwYXJhbSB7Kn0gbWVpIFxuICAgKiBAcmV0dXJucyBcbiAgICovXG4gIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5wcm90b3R5cGUuaXNFbXB0eU1FSSA9IGZ1bmN0aW9uIChtZWkpIHtcbiAgICAvL2NvbnZlcnQgc3RyaW5nIGZvciBwcm9wZXIgcGFyc2luZ1xuICAgIGlmICghbWVpKSByZXR1cm4gdHJ1ZVxuICAgIG1laSA9IG1laS5yZXBsYWNlKC9cXG4vZywgXCJcIik7IC8vIGRlbGV0ZSBhbGwgdW5uZWNlc3NhcnkgbmV3bGluZVxuICAgIG1laSA9IG1laS5yZXBsYWNlKC9cXHN7Mix9L2csIFwiXCIpOyAvLyBkZWxldGUgYWxsIHVubmVjZXNzYXJ5IHdoaXRlc3BhY2VzXG4gICAgbWVpID0gbWVpLnJlcGxhY2UoLyZhbXA7L2csIFwiJlwiKS5yZXBsYWNlKC8mZ3Q7L2csIFwiPlwiKS5yZXBsYWNlKC8mbHQ7L2csIFwiPFwiKS5yZXBsYWNlKC8mcXVvdDsvZywgXCJcXFwiXCIpO1xuXG4gICAgdmFyIHBhcnNlciA9IG5ldyBET01QYXJzZXIoKVxuICAgIHZhciB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKG1laSwgXCJ0ZXh0L3htbFwiKVxuICAgIHJldHVybiB4bWxEb2MucXVlcnlTZWxlY3RvckFsbChcImxheWVyXCIpLmxlbmd0aCA9PT0gMSAmJiB4bWxEb2MucXVlcnlTZWxlY3RvcihcImxheWVyIG1SZXN0XCIpICE9PSBudWxsXG4gIH1cblxuICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UucHJvdG90eXBlLmdlbmVyYXRlVUlEID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaXJzdFBhcnQgPSAoKE1hdGgucmFuZG9tKCkgKiA0NjY1NikgfCAwKS50b1N0cmluZygzNilcbiAgICB2YXIgc2Vjb25kUGFydCA9ICgoTWF0aC5yYW5kb20oKSAqIDQ2NjU2KSB8IDApLnRvU3RyaW5nKDM2KVxuICAgIGZpcnN0UGFydCA9IChcIjAwMFwiICsgZmlyc3RQYXJ0KS5zbGljZSgtMyk7XG4gICAgc2Vjb25kUGFydCA9IChcIjAwMFwiICsgc2Vjb25kUGFydCkuc2xpY2UoLTMpO1xuICAgIHJldHVybiBmaXJzdFBhcnQgKyBzZWNvbmRQYXJ0O1xuICB9XG5cbiAgcmV0dXJuIE11c2ljTm90YXRpb25NdWx0aUNob2ljZVxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgTU5NQyIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFwiLi4vY3NzL211c2ljbm90YXRpb24tbXVsdGljaG9pY2UuY3NzXCJcbmltcG9ydCBNTk1DIGZyb20gXCIuLi9qcy9tdXNpY25vdGF0aW9uLW11bHRpY2hvaWNlLmpzXCJcblxuLy8gTG9hZCBsaWJyYXJ5XG5INVAgPSBINVAgfHwge307XG5INVAuTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlID0gTU5NQztcbiJdLCJuYW1lcyI6WyJFdmVudERpc3BhdGNoZXIiLCJINVAiLCJqUXVlcnkiLCJKb3ViZWxVSSIsIlF1ZXN0aW9uIiwic2h1ZmZsZUFycmF5IiwiJCIsIlVJIiwiTU5NQyIsIk11c2ljTm90YXRpb25NdWx0aUNob2ljZSIsIm9wdGlvbnMiLCJjb250ZW50SWQiLCJjb250ZW50RGF0YSIsInNlbGYiLCJjYWxsIiwidGFza0NvbnRhaW5lckhlaWdodCIsImRlZmF1bHRzIiwiaW1hZ2UiLCJxdWVzdGlvbiIsImFuc3dlcnMiLCJ0aXBzQW5kRmVlZGJhY2siLCJ0aXAiLCJjaG9zZW5GZWVkYmFjayIsIm5vdENob3NlbkZlZWRiYWNrIiwidGV4dCIsImNvcnJlY3QiLCJvdmVyYWxsRmVlZGJhY2siLCJ3ZWlnaHQiLCJ1c2VyQW5zd2VycyIsImNoZWNrQW5zd2VyQnV0dG9uIiwic3VibWl0QW5zd2VyQnV0dG9uIiwic2hvd1NvbHV0aW9uQnV0dG9uIiwidHJ5QWdhaW5CdXR0b24iLCJzY29yZUJhckxhYmVsIiwidGlwQXZhaWxhYmxlIiwiZmVlZGJhY2tBdmFpbGFibGUiLCJyZWFkRmVlZGJhY2siLCJzaG91bGRDaGVjayIsInNob3VsZE5vdENoZWNrIiwibm9JbnB1dCIsImExMXlDaGVjayIsImExMXlTaG93U29sdXRpb24iLCJhMTF5UmV0cnkiLCJiZWhhdmlvdXIiLCJlbmFibGVSZXRyeSIsImVuYWJsZVNvbHV0aW9uc0J1dHRvbiIsImVuYWJsZUNoZWNrQnV0dG9uIiwidHlwZSIsInNpbmdsZVBvaW50IiwicmFuZG9tQW5zd2VycyIsInNob3dTb2x1dGlvbnNSZXF1aXJlc0lucHV0IiwiYXV0b0NoZWNrIiwicGFzc1BlcmNlbnRhZ2UiLCJzaG93U2NvcmVQb2ludHMiLCJwYXJhbXMiLCJleHRlbmQiLCJjb25zb2xlIiwibG9nIiwibnVtQ29ycmVjdCIsImkiLCJsZW5ndGgiLCJhbnN3ZXIiLCJibGFua0lzQ29ycmVjdCIsInNpbmdsZUFuc3dlciIsImdldENoZWNrYm94T3JSYWRpb0ljb24iLCJyYWRpbyIsInNlbGVjdGVkIiwiaWNvbiIsIiRteURvbSIsIiRmZWVkYmFja0RpYWxvZyIsInJlbW92ZUZlZWRiYWNrRGlhbG9nIiwidW5iaW5kIiwiZmluZCIsInJlbW92ZSIsInJlbW92ZUNsYXNzIiwic2NvcmUiLCJzb2x1dGlvbnNWaXNpYmxlIiwiYWRkRmVlZGJhY2siLCIkZWxlbWVudCIsImZlZWRiYWNrIiwiYXBwZW5kVG8iLCJhZGRDbGFzcyIsInJlZ2lzdGVyRG9tRWxlbWVudHMiLCJtZWRpYSIsImxpYnJhcnkiLCJzcGxpdCIsImZpbGUiLCJzZXRJbWFnZSIsInBhdGgiLCJkaXNhYmxlSW1hZ2Vab29taW5nIiwiYWx0IiwidGl0bGUiLCJzb3VyY2VzIiwic2V0VmlkZW8iLCJmaWxlcyIsInNldEF1ZGlvIiwiY2hlY2tib3hPclJhZGlvSWNvbiIsImluZGV4T2YiLCJzZXRJbnRyb2R1Y3Rpb24iLCJsYWJlbElkIiwicm9sZSIsInRhYmluZGV4IiwiY2hlY2tlZCIsImh0bWwiLCJ0b1N0cmluZyIsInNldENvbnRlbnQiLCIkYW5zd2VycyIsImVhY2giLCJ1bmRlZmluZWQiLCJ0cmltIiwidGlwQ29udGVudCIsInJlcGxhY2UiLCIkd3JhcCIsIiRtdWx0aWNob2ljZVRpcCIsInRpcHNMYWJlbCIsInRpcEljb25IdG1sIiwiYXBwZW5kIiwiY2xpY2siLCIkdGlwQ29udGFpbmVyIiwicGFyZW50cyIsIm9wZW5GZWVkYmFjayIsImNoaWxkcmVuIiwiaXMiLCJhdHRyIiwicmVhZCIsInRyaWdnZXIiLCJzZXRUaW1lb3V0Iiwia2V5ZG93biIsImUiLCJ3aGljaCIsInRvZ2dsZUNoZWNrIiwiJGFucyIsImFuc3dlcmVkIiwibnVtIiwicGFyc2VJbnQiLCJkYXRhIiwibm90IiwicG9zIiwic3BsaWNlIiwicHVzaCIsImNhbGNTY29yZSIsInRyaWdnZXJYQVBJIiwiaGlkZVNvbHV0aW9uIiwic2hvd0J1dHRvbiIsImhpZGVCdXR0b24iLCJjaGVja0Fuc3dlciIsInNob3dDaGVja1NvbHV0aW9uIiwiZ2V0TWF4U2NvcmUiLCJrZXlDb2RlIiwiJHByZXYiLCJwcmV2IiwiZm9jdXMiLCIkbmV4dCIsIm5leHQiLCJibHVyIiwiZmlsdGVyIiwiZmlyc3QiLCJhZGQiLCJsYXN0IiwiYWRkQnV0dG9ucyIsImhhc0NoZWNrZWRBbnN3ZXIiLCJzaG93QWxsU29sdXRpb25zIiwiJGUiLCJhIiwiY2xhc3NOYW1lIiwiZGlzYWJsZUlucHV0Iiwic2hvd1NvbHV0aW9ucyIsIiRhbnN3ZXIiLCJoaWRlU29sdXRpb25zIiwicmVtb3ZlRmVlZGJhY2siLCJyZXNldFRhc2siLCJyZW1vdmVTZWxlY3Rpb25zIiwiZW5hYmxlSW5wdXQiLCJjYWxjdWxhdGVNYXhTY29yZSIsIm1heFNjb3JlIiwiY2hvaWNlIiwieEFQSUV2ZW50IiwiY3JlYXRlWEFQSUV2ZW50VGVtcGxhdGUiLCJhZGRRdWVzdGlvblRvWEFQSSIsImFkZFJlc3BvbnNlVG9YQVBJIiwiJGNvbnRlbnQiLCIkY29udGFpbmVyUGFyZW50cyIsIiRjb250YWluZXIiLCJkb2N1bWVudCIsImJvZHkiLCJhZGRCdXR0b24iLCJnZXRBbnN3ZXJHaXZlbiIsInVwZGF0ZUZlZWRiYWNrQ29udGVudCIsImNvbmZpcm1hdGlvbkRpYWxvZyIsImVuYWJsZSIsImNvbmZpcm1DaGVja0RpYWxvZyIsImwxMG4iLCJjb25maXJtQ2hlY2siLCJpbnN0YW5jZSIsIiRwYXJlbnRFbGVtZW50IiwidGV4dElmU3VibWl0dGluZyIsIm9sZElkTWFwIiwiaWRNYXAiLCJnZXRTaHVmZmxlTWFwIiwiYW5zd2Vyc0Rpc3BsYXllZCIsImRldGFjaCIsImNvbmZpcm1SZXRyeURpYWxvZyIsImNvbmZpcm1SZXRyeSIsImdldEZlZWRiYWNrVGV4dCIsIm1heCIsInJhdGlvIiwiZGV0ZXJtaW5lT3ZlcmFsbEZlZWRiYWNrIiwic2tpcEZlZWRiYWNrIiwic2NvcmVQb2ludHMiLCJTY29yZVBvaW50cyIsImNob3NlbiIsImhhc0NsYXNzIiwiY29ycmVjdEFuc3dlciIsIndyb25nQW5zd2VyIiwiYWx0ZXJuYXRpdmVDb250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwiYXBwZW5kQ2hpbGQiLCJnZXRFbGVtZW50IiwiZnVsbFNjb3JlIiwic2V0RmVlZGJhY2siLCJyZW1vdmVBdHRyIiwiZ2V0WEFQSURhdGEiLCJzdGF0ZW1lbnQiLCJkZWZpbml0aW9uIiwiZ2V0VmVyaWZpZWRTdGF0ZW1lbnRWYWx1ZSIsImRlc2NyaXB0aW9uIiwiaW50ZXJhY3Rpb25UeXBlIiwiY29ycmVjdFJlc3BvbnNlc1BhdHRlcm4iLCJjaG9pY2VzIiwib3JpZ2luYWxPcmRlciIsInN1Y2Nlc3MiLCJzZXRTY29yZWRSZXN1bHQiLCJyZXNwb25zZSIsInJlc3VsdCIsInByZXZpb3VzU3RhdGUiLCJrIiwiaiIsImFucyIsImNvdW50ZXIiLCJnZXRDdXJyZW50U3RhdGUiLCJzdGF0ZSIsImlnbm9yZUNoZWNrIiwiZ2V0U2NvcmUiLCJnZXRUaXRsZSIsImNyZWF0ZVRpdGxlIiwibWV0YWRhdGEiLCJsb2FkT2JzZXJ2ZXJzIiwicHJvdG90eXBlIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJzYW5pdGl6ZVhNTFN0cmluZyIsInhtbCIsInRoYXQiLCJpbnN0YW5jZVBhc3NlZCIsImRvbUF0dGFjaE9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsImZvckVhY2giLCJtdXRhdGlvbiIsIkFycmF5IiwiZnJvbSIsImFkZGVkTm9kZXMiLCJhbiIsIm5hbWUiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJwYXJlbnRFbGVtZW50IiwidmliZUNvbnRhaW5lckRpdiIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwibG9hZFNWRyIsImFkanVzdEZyYW1lIiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJyb290Q29udGFpbmVyIiwicXVlc3Rpb25faW5zdGFuY2VfbnVtIiwid2luZG93IiwicXVlcnlTZWxlY3RvckFsbCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInF1ZXN0aW9uX2NvbnRhaW5lciIsInF1ZXN0aW9uX25vdGF0aW9uX2xpc3QiLCJub3RhdGlvbldpZGdldCIsIiR2aWJlUXVlc3Rpb24iLCJnZW5lcmF0ZVVJRCIsInN2Z291dCIsIkRPTVBhcnNlciIsInBhcnNlRnJvbVN0cmluZyIsImZpcnN0Q2hpbGQiLCJjIiwibSIsImFuc3dlcl9ub3RhdGlvbiIsImlzRW1wdHlNRUkiLCJ1dWlkIiwiJHZpYmVBbnN3ZXIiLCJhbnN3ZXJDb250YWluZXIiLCJ2aWJlSW5zdGFuY2VzIiwidmliZUNvbnRhaW5lciIsImNvbnRhaW5lclNWRyIsImlkIiwiZXZlcnkiLCJjaGlsZCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImhlaWdodCIsInN0eWxlIiwid2lkdGgiLCJtZWkiLCJwYXJzZXIiLCJ4bWxEb2MiLCJmaXJzdFBhcnQiLCJNYXRoIiwicmFuZG9tIiwic2Vjb25kUGFydCIsInNsaWNlIl0sInNvdXJjZVJvb3QiOiIifQ==