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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7O0FDTjZDO0FBQ1E7O0FBRXJEO0FBQ0FQLEdBQUcsR0FBR0EsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNmQSxHQUFHLENBQUNRLHdCQUF3QixHQUFHRCx3RUFBSSxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS8uL2pzL2dsb2JhbHMuanMiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS8uL2pzL211c2ljbm90YXRpb24tbXVsdGljaG9pY2UuanMiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS8uL2Nzcy9tdXNpY25vdGF0aW9uLW11bHRpY2hvaWNlLmNzcz8xNDAwIiwid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbXVzaWNub3RhdGlvbl9tdWx0aWNob2ljZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL211c2ljbm90YXRpb25fbXVsdGljaG9pY2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9tdXNpY25vdGF0aW9uX211bHRpY2hvaWNlLy4vZW50cmllcy9lbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgRXZlbnREaXNwYXRjaGVyID0gSDVQLkV2ZW50RGlzcGF0Y2hlcjtcbmV4cG9ydCBjb25zdCBqUXVlcnkgPSBINVAualF1ZXJ5O1xuZXhwb3J0IGNvbnN0IEpvdWJlbFVJID0gSDVQLkpvdWJlbFVJO1xuZXhwb3J0IGNvbnN0IFF1ZXN0aW9uID0gSDVQLlF1ZXN0aW9uO1xuZXhwb3J0IGNvbnN0IHNodWZmbGVBcnJheSA9IEg1UC5zaHVmZmxlQXJyYXk7IiwiLy8gV2lsbCByZW5kZXIgYSBRdWVzdGlvbiB3aXRoIG11bHRpcGxlIGNob2ljZXMgZm9yIGFuc3dlcnMuXG4vLyBPcHRpb25zIGZvcm1hdDpcbi8vIHtcbi8vICAgdGl0bGU6IFwiT3B0aW9uYWwgdGl0bGUgZm9yIHF1ZXN0aW9uIGJveFwiLFxuLy8gICBxdWVzdGlvbjogXCJRdWVzdGlvbiB0ZXh0XCIsXG4vLyAgIGFuc3dlcnM6IFt7dGV4dDogXCJBbnN3ZXIgdGV4dFwiLCBjb3JyZWN0OiBmYWxzZX0sIC4uLl0sXG4vLyAgIHNpbmdsZUFuc3dlcjogdHJ1ZSwgLy8gb3IgZmFsc2UsIHdpbGwgY2hhbmdlIHJlbmRlcmVkIG91dHB1dCBzbGlnaHRseS5cbi8vICAgc2luZ2xlUG9pbnQ6IHRydWUsICAvLyBUcnVlIGlmIHF1ZXN0aW9uIGdpdmUgYSBzaW5nbGUgcG9pbnQgc2NvcmUgb25seVxuLy8gICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGFsbCBhcmUgY29ycmVjdCwgZmFsc2UgdG8gZ2l2ZSAxIHBvaW50IHBlclxuLy8gICAgICAgICAgICAgICAgICAgICAgIC8vIGNvcnJlY3QgYW5zd2VyLiAoT25seSBmb3Igc2luZ2xlQW5zd2VyPWZhbHNlKVxuLy8gICByYW5kb21BbnN3ZXJzOiBmYWxzZSAgLy8gV2hldGhlciB0byByYW5kb21pemUgdGhlIG9yZGVyIG9mIGFuc3dlcnMuXG4vLyB9XG4vL1xuLy8gRXZlbnRzIHByb3ZpZGVkOlxuLy8gLSBoNXBRdWVzdGlvbkFuc3dlcmVkOiBUcmlnZ2VyZWQgd2hlbiBhIHF1ZXN0aW9uIGhhcyBiZWVuIGFuc3dlcmVkLlxuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE9wdGlvbnNcbiAqICAgT3B0aW9ucyBmb3IgbXVsdGlwbGUgY2hvaWNlXG4gKlxuICogQHByb3BlcnR5IHtPYmplY3R9IGJlaGF2aW91clxuICogQHByb3BlcnR5IHtib29sZWFufSBiZWhhdmlvdXIuY29uZmlybUNoZWNrRGlhbG9nXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGJlaGF2aW91ci5jb25maXJtUmV0cnlEaWFsb2dcbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gVUlcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBVSS50aXBzTGFiZWxcbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gW2NvbmZpcm1SZXRyeV1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybVJldHJ5LmhlYWRlcl1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybVJldHJ5LmJvZHldXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1SZXRyeS5jYW5jZWxMYWJlbF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybVJldHJ5LmNvbmZpcm1MYWJlbF1cbiAqXG4gKiBAcHJvcGVydHkge09iamVjdH0gW2NvbmZpcm1DaGVja11cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybUNoZWNrLmhlYWRlcl1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybUNoZWNrLmJvZHldXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2NvbmZpcm1DaGVjay5jYW5jZWxMYWJlbF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29uZmlybUNoZWNrLmNvbmZpcm1MYWJlbF1cbiAqL1xuXG4vKipcbiAqIE1vZHVsZSBmb3IgY3JlYXRpbmcgYSBtdWx0aXBsZSBjaG9pY2UgcXVlc3Rpb25cbiAqXG4gKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb250ZW50SWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZW50RGF0YVxuICogQHJldHVybnMge011c2ljTm90YXRpb25NdWx0aUNob2ljZX1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5cbi8vaW1wb3J0IFZJQkUgZnJvbSBcInZlcm92aW9zY29yZWVkaXRvclwiO1xuaW1wb3J0IHtcbiAgalF1ZXJ5IGFzICQsIEpvdWJlbFVJIGFzIFVJLCBRdWVzdGlvbiwgc2h1ZmZsZUFycmF5XG59XG4gIGZyb20gXCIuL2dsb2JhbHNcIjtcblxuY29uc3QgTU5NQyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gb3B0aW9ucyBcbiAgICogQHBhcmFtIHsqfSBjb250ZW50SWQgXG4gICAqIEBwYXJhbSB7Kn0gY29udGVudERhdGEgXG4gICAqIEByZXR1cm5zIFxuICAgKi9cbiAgZnVuY3Rpb24gTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlKG9wdGlvbnMsIGNvbnRlbnRJZCwgY29udGVudERhdGEpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlKSlcbiAgICAgIHJldHVybiBuZXcgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlKG9wdGlvbnMsIGNvbnRlbnRJZCwgY29udGVudERhdGEpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmNvbnRlbnRJZCA9IGNvbnRlbnRJZDtcbiAgICB0aGlzLmNvbnRlbnREYXRhID0gY29udGVudERhdGE7XG4gICAgUXVlc3Rpb24uY2FsbChzZWxmLCAnbXVsdGljaG9pY2UnKTtcbiAgICB0aGlzLnRhc2tDb250YWluZXJIZWlnaHQgPSAwXG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICBpbWFnZTogbnVsbCxcbiAgICAgIHF1ZXN0aW9uOiBcIk5vIHF1ZXN0aW9uIHRleHQgcHJvdmlkZWRcIixcbiAgICAgIGFuc3dlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRpcHNBbmRGZWVkYmFjazoge1xuICAgICAgICAgICAgdGlwOiAnJyxcbiAgICAgICAgICAgIGNob3NlbkZlZWRiYWNrOiAnJyxcbiAgICAgICAgICAgIG5vdENob3NlbkZlZWRiYWNrOiAnJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdGV4dDogXCJBbnN3ZXIgMVwiLFxuICAgICAgICAgIGNvcnJlY3Q6IHRydWVcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIG92ZXJhbGxGZWVkYmFjazogW10sXG4gICAgICB3ZWlnaHQ6IDEsXG4gICAgICB1c2VyQW5zd2VyczogW10sXG4gICAgICBVSToge1xuICAgICAgICBjaGVja0Fuc3dlckJ1dHRvbjogJ0NoZWNrJyxcbiAgICAgICAgc3VibWl0QW5zd2VyQnV0dG9uOiAnU3VibWl0JyxcbiAgICAgICAgc2hvd1NvbHV0aW9uQnV0dG9uOiAnU2hvdyBzb2x1dGlvbicsXG4gICAgICAgIHRyeUFnYWluQnV0dG9uOiAnVHJ5IGFnYWluJyxcbiAgICAgICAgc2NvcmVCYXJMYWJlbDogJ1lvdSBnb3QgOm51bSBvdXQgb2YgOnRvdGFsIHBvaW50cycsXG4gICAgICAgIHRpcEF2YWlsYWJsZTogXCJUaXAgYXZhaWxhYmxlXCIsXG4gICAgICAgIGZlZWRiYWNrQXZhaWxhYmxlOiBcIkZlZWRiYWNrIGF2YWlsYWJsZVwiLFxuICAgICAgICByZWFkRmVlZGJhY2s6ICdSZWFkIGZlZWRiYWNrJyxcbiAgICAgICAgc2hvdWxkQ2hlY2s6IFwiU2hvdWxkIGhhdmUgYmVlbiBjaGVja2VkXCIsXG4gICAgICAgIHNob3VsZE5vdENoZWNrOiBcIlNob3VsZCBub3QgaGF2ZSBiZWVuIGNoZWNrZWRcIixcbiAgICAgICAgbm9JbnB1dDogJ0lucHV0IGlzIHJlcXVpcmVkIGJlZm9yZSB2aWV3aW5nIHRoZSBzb2x1dGlvbicsXG4gICAgICAgIGExMXlDaGVjazogJ0NoZWNrIHRoZSBhbnN3ZXJzLiBUaGUgcmVzcG9uc2VzIHdpbGwgYmUgbWFya2VkIGFzIGNvcnJlY3QsIGluY29ycmVjdCwgb3IgdW5hbnN3ZXJlZC4nLFxuICAgICAgICBhMTF5U2hvd1NvbHV0aW9uOiAnU2hvdyB0aGUgc29sdXRpb24uIFRoZSB0YXNrIHdpbGwgYmUgbWFya2VkIHdpdGggaXRzIGNvcnJlY3Qgc29sdXRpb24uJyxcbiAgICAgICAgYTExeVJldHJ5OiAnUmV0cnkgdGhlIHRhc2suIFJlc2V0IGFsbCByZXNwb25zZXMgYW5kIHN0YXJ0IHRoZSB0YXNrIG92ZXIgYWdhaW4uJyxcbiAgICAgIH0sXG4gICAgICBiZWhhdmlvdXI6IHtcbiAgICAgICAgZW5hYmxlUmV0cnk6IHRydWUsXG4gICAgICAgIGVuYWJsZVNvbHV0aW9uc0J1dHRvbjogdHJ1ZSxcbiAgICAgICAgZW5hYmxlQ2hlY2tCdXR0b246IHRydWUsXG4gICAgICAgIHR5cGU6ICdhdXRvJyxcbiAgICAgICAgc2luZ2xlUG9pbnQ6IHRydWUsXG4gICAgICAgIHJhbmRvbUFuc3dlcnM6IGZhbHNlLFxuICAgICAgICBzaG93U29sdXRpb25zUmVxdWlyZXNJbnB1dDogdHJ1ZSxcbiAgICAgICAgYXV0b0NoZWNrOiBmYWxzZSxcbiAgICAgICAgcGFzc1BlcmNlbnRhZ2U6IDEwMCxcbiAgICAgICAgc2hvd1Njb3JlUG9pbnRzOiB0cnVlXG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgcGFyYW1zID0gJC5leHRlbmQodHJ1ZSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgY29uc29sZS5sb2coXCJNdWx0aWNob2ljZVwiLCBwYXJhbXMpXG5cbiAgICAvL2FycmF5IG9mIGNvbnRhaW5lcnMuIHdpbGwgYmUgdXNlZCBmb3Igc2NhbGluZyBsYXRlclxuICAgIC8vIHRoaXMudmliZUNvbnRhaW5lciA9IFtdXG4gICAgLy8gdGhpcy52aWJlSW5zdGFuY2VzID0gW11cblxuICAgIC8vIEtlZXAgdHJhY2sgb2YgbnVtYmVyIG9mIGNvcnJlY3QgY2hvaWNlc1xuICAgIHZhciBudW1Db3JyZWN0ID0gMDtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBjaG9pY2VzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGFuc3dlciA9IHBhcmFtcy5hbnN3ZXJzW2ldO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGlwcyBhbmQgZmVlZGJhY2sgZXhpc3RzXG4gICAgICBhbnN3ZXIudGlwc0FuZEZlZWRiYWNrID0gYW5zd2VyLnRpcHNBbmRGZWVkYmFjayB8fCB7fTtcblxuICAgICAgaWYgKHBhcmFtcy5hbnN3ZXJzW2ldLmNvcnJlY3QpIHtcbiAgICAgICAgLy8gVXBkYXRlIG51bWJlciBvZiBjb3JyZWN0IGNob2ljZXNcbiAgICAgICAgbnVtQ29ycmVjdCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERldGVybWluZSBpZiBubyBjaG9pY2VzIGlzIHRoZSBjb3JyZWN0XG4gICAgdmFyIGJsYW5rSXNDb3JyZWN0ID0gKG51bUNvcnJlY3QgPT09IDApO1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRhc2sgdHlwZVxuICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnR5cGUgPT09ICdhdXRvJykge1xuICAgICAgLy8gVXNlIHNpbmdsZSBjaG9pY2UgaWYgb25seSBvbmUgY2hvaWNlIGlzIGNvcnJlY3RcbiAgICAgIHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyID0gKG51bUNvcnJlY3QgPT09IDEpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyID0gKHBhcmFtcy5iZWhhdmlvdXIudHlwZSA9PT0gJ3NpbmdsZScpO1xuICAgIH1cblxuICAgIHZhciBnZXRDaGVja2JveE9yUmFkaW9JY29uID0gZnVuY3Rpb24gKHJhZGlvLCBzZWxlY3RlZCkge1xuICAgICAgdmFyIGljb247XG4gICAgICBpZiAocmFkaW8pIHtcbiAgICAgICAgaWNvbiA9IHNlbGVjdGVkID8gJyYjeGU2MDM7JyA6ICcmI3hlNjAwOyc7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWNvbiA9IHNlbGVjdGVkID8gJyYjeGU2MDE7JyA6ICcmI3hlNjAyOyc7XG4gICAgICB9XG4gICAgICByZXR1cm4gaWNvbjtcbiAgICB9O1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBidXR0b25zIGFuZCBlbGVtZW50cy5cbiAgICB2YXIgJG15RG9tO1xuICAgIHZhciAkZmVlZGJhY2tEaWFsb2c7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIGZlZWRiYWNrIGRpYWxvZ3NcbiAgICAgKi9cbiAgICB2YXIgcmVtb3ZlRmVlZGJhY2tEaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBSZW1vdmUgdGhlIG9wZW4gZmVlZGJhY2sgZGlhbG9ncy5cbiAgICAgICRteURvbS51bmJpbmQoJ2NsaWNrJywgcmVtb3ZlRmVlZGJhY2tEaWFsb2cpO1xuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtZmVlZGJhY2stYnV0dG9uLCAuaDVwLWZlZWRiYWNrLWRpYWxvZycpLnJlbW92ZSgpO1xuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtaGFzLWZlZWRiYWNrJykucmVtb3ZlQ2xhc3MoJ2g1cC1oYXMtZmVlZGJhY2snKTtcbiAgICAgIGlmICgkZmVlZGJhY2tEaWFsb2cpIHtcbiAgICAgICAgJGZlZWRiYWNrRGlhbG9nLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2NvcmUgPSAwO1xuICAgIHZhciBzb2x1dGlvbnNWaXNpYmxlID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBBZGQgZmVlZGJhY2sgdG8gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCBFbGVtZW50IHRoYXQgZmVlZGJhY2sgd2lsbCBiZSBhZGRlZCB0b1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmZWVkYmFjayBGZWVkYmFjayBzdHJpbmdcbiAgICAgKi9cbiAgICB2YXIgYWRkRmVlZGJhY2sgPSBmdW5jdGlvbiAoJGVsZW1lbnQsIGZlZWRiYWNrKSB7XG4gICAgICAkZmVlZGJhY2tEaWFsb2cgPSAkKCcnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJoNXAtZmVlZGJhY2stZGlhbG9nXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiaDVwLWZlZWRiYWNrLWlubmVyXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiaDVwLWZlZWRiYWNrLXRleHRcIj4nICsgZmVlZGJhY2sgKyAnPC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicpO1xuXG4gICAgICAvL21ha2Ugc3VyZSBmZWVkYmFjayBpcyBvbmx5IGFkZGVkIG9uY2VcbiAgICAgIGlmICghJGVsZW1lbnQuZmluZCgkKCcuaDVwLWZlZWRiYWNrLWRpYWxvZycpKS5sZW5ndGgpIHtcbiAgICAgICAgJGZlZWRiYWNrRGlhbG9nLmFwcGVuZFRvKCRlbGVtZW50LmFkZENsYXNzKCdoNXAtaGFzLWZlZWRiYWNrJykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciB0aGUgZGlmZmVyZW50IHBhcnRzIG9mIHRoZSB0YXNrIHdpdGggdGhlIFF1ZXN0aW9uIHN0cnVjdHVyZS5cbiAgICAgKi9cbiAgICBzZWxmLnJlZ2lzdGVyRG9tRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbWVkaWEgPSBwYXJhbXMubWVkaWE7XG4gICAgICBpZiAobWVkaWEgJiYgbWVkaWEudHlwZSAmJiBtZWRpYS50eXBlLmxpYnJhcnkpIHtcbiAgICAgICAgbWVkaWEgPSBtZWRpYS50eXBlO1xuICAgICAgICB2YXIgdHlwZSA9IG1lZGlhLmxpYnJhcnkuc3BsaXQoJyAnKVswXTtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdINVAuSW1hZ2UnKSB7XG4gICAgICAgICAgaWYgKG1lZGlhLnBhcmFtcy5maWxlKSB7XG4gICAgICAgICAgICAvLyBSZWdpc3RlciB0YXNrIGltYWdlXG4gICAgICAgICAgICBzZWxmLnNldEltYWdlKG1lZGlhLnBhcmFtcy5maWxlLnBhdGgsIHtcbiAgICAgICAgICAgICAgZGlzYWJsZUltYWdlWm9vbWluZzogcGFyYW1zLm1lZGlhLmRpc2FibGVJbWFnZVpvb21pbmcgfHwgZmFsc2UsXG4gICAgICAgICAgICAgIGFsdDogbWVkaWEucGFyYW1zLmFsdCxcbiAgICAgICAgICAgICAgdGl0bGU6IG1lZGlhLnBhcmFtcy50aXRsZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdINVAuVmlkZW8nKSB7XG4gICAgICAgICAgaWYgKG1lZGlhLnBhcmFtcy5zb3VyY2VzKSB7XG4gICAgICAgICAgICAvLyBSZWdpc3RlciB0YXNrIHZpZGVvXG4gICAgICAgICAgICBzZWxmLnNldFZpZGVvKG1lZGlhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ0g1UC5BdWRpbycpIHtcbiAgICAgICAgICBpZiAobWVkaWEucGFyYW1zLmZpbGVzKSB7XG4gICAgICAgICAgICAvLyBSZWdpc3RlciB0YXNrIGF1ZGlvXG4gICAgICAgICAgICBzZWxmLnNldEF1ZGlvKG1lZGlhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZXJtaW5lIGlmIHdlJ3JlIHVzaW5nIGNoZWNrYm94ZXMgb3IgcmFkaW8gYnV0dG9uc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXJhbXMuYW5zd2Vyc1tpXS5jaGVja2JveE9yUmFkaW9JY29uID0gZ2V0Q2hlY2tib3hPclJhZGlvSWNvbihwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciwgcGFyYW1zLnVzZXJBbnN3ZXJzLmluZGV4T2YoaSkgPiAtMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlZ2lzdGVyIEludHJvZHVjdGlvblxuICAgICAgc2VsZi5zZXRJbnRyb2R1Y3Rpb24oJzxkaXYgaWQ9XCInICsgcGFyYW1zLmxhYmVsSWQgKyAnXCI+JyArIHBhcmFtcy5xdWVzdGlvbiArICc8L2Rpdj4nKTtcblxuICAgICAgLy8gUmVnaXN0ZXIgdGFzayBjb250ZW50IGFyZWFcbiAgICAgICRteURvbSA9ICQoJzx1bD4nLCB7XG4gICAgICAgICdjbGFzcyc6ICdoNXAtYW5zd2VycycsXG4gICAgICAgIHJvbGU6IHBhcmFtcy5yb2xlLFxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogcGFyYW1zLmxhYmVsSWRcbiAgICAgIH0pO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlciA9IHBhcmFtcy5hbnN3ZXJzW2ldO1xuICAgICAgICAkKCc8bGk+Jywge1xuICAgICAgICAgICdjbGFzcyc6ICdoNXAtYW5zd2VyJyxcbiAgICAgICAgICByb2xlOiBhbnN3ZXIucm9sZSxcbiAgICAgICAgICB0YWJpbmRleDogYW5zd2VyLnRhYmluZGV4LFxuICAgICAgICAgICdhcmlhLWNoZWNrZWQnOiBhbnN3ZXIuY2hlY2tlZCxcbiAgICAgICAgICAnZGF0YS1pZCc6IGksXG4gICAgICAgICAgaHRtbDogJzxkaXYgY2xhc3M9XCJoNXAtYWx0ZXJuYXRpdmUtY29udGFpbmVyXCIgYW5zd2VyLWlkPVwiJyArIGkudG9TdHJpbmcoKSArICdcIj48c3BhbiBjbGFzcz1cImg1cC1hbHRlcm5hdGl2ZS1pbm5lclwiPicgKyBhbnN3ZXIudGV4dCArICc8L3NwYW4+PC9kaXY+JyxcbiAgICAgICAgICBhcHBlbmRUbzogJG15RG9tXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBzZWxmLnNldENvbnRlbnQoJG15RG9tLCB7XG4gICAgICAgICdjbGFzcyc6IHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyID8gJ2g1cC1yYWRpbycgOiAnaDVwLWNoZWNrJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIENyZWF0ZSB0aXBzOlxuICAgICAgdmFyICRhbnN3ZXJzID0gJCgnLmg1cC1hbnN3ZXInLCAkbXlEb20pLmVhY2goZnVuY3Rpb24gKGkpIHtcblxuICAgICAgICB2YXIgdGlwID0gcGFyYW1zLmFuc3dlcnNbaV0udGlwc0FuZEZlZWRiYWNrLnRpcDtcbiAgICAgICAgaWYgKHRpcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBObyB0aXBcbiAgICAgICAgfVxuXG4gICAgICAgIHRpcCA9IHRpcC50cmltKCk7XG4gICAgICAgIHZhciB0aXBDb250ZW50ID0gdGlwXG4gICAgICAgICAgLnJlcGxhY2UoLyZuYnNwOy9nLCAnJylcbiAgICAgICAgICAucmVwbGFjZSgvPHA+L2csICcnKVxuICAgICAgICAgIC5yZXBsYWNlKC88XFwvcD4vZywgJycpXG4gICAgICAgICAgLnRyaW0oKTtcbiAgICAgICAgaWYgKCF0aXBDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybjsgLy8gRW1wdHkgdGlwXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnaDVwLWhhcy10aXAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCB0aXBcbiAgICAgICAgdmFyICR3cmFwID0gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICdjbGFzcyc6ICdoNXAtbXVsdGljaG9pY2UtdGlwd3JhcCcsXG4gICAgICAgICAgJ2FyaWEtbGFiZWwnOiBwYXJhbXMuVUkudGlwQXZhaWxhYmxlICsgJy4nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciAkbXVsdGljaG9pY2VUaXAgPSAkKCc8ZGl2PicsIHtcbiAgICAgICAgICAncm9sZSc6ICdidXR0b24nLFxuICAgICAgICAgICd0YWJpbmRleCc6IDAsXG4gICAgICAgICAgJ3RpdGxlJzogcGFyYW1zLlVJLnRpcHNMYWJlbCxcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IHBhcmFtcy5VSS50aXBzTGFiZWwsXG4gICAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgICAgICAnY2xhc3MnOiAnbXVsdGljaG9pY2UtdGlwJyxcbiAgICAgICAgICBhcHBlbmRUbzogJHdyYXBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHRpcEljb25IdG1sID0gJzxzcGFuIGNsYXNzPVwiam91YmVsLWljb24tdGlwLW5vcm1hbFwiPicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImg1cC1pY29uLXNoYWRvd1wiPjwvc3Bhbj4nICtcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJoNXAtaWNvbi1zcGVlY2gtYnViYmxlXCI+PC9zcGFuPicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImg1cC1pY29uLWluZm9cIj48L3NwYW4+JyArXG4gICAgICAgICAgJzwvc3Bhbj4nO1xuXG4gICAgICAgICRtdWx0aWNob2ljZVRpcC5hcHBlbmQodGlwSWNvbkh0bWwpO1xuXG4gICAgICAgICRtdWx0aWNob2ljZVRpcC5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyICR0aXBDb250YWluZXIgPSAkbXVsdGljaG9pY2VUaXAucGFyZW50cygnLmg1cC1hbnN3ZXInKTtcbiAgICAgICAgICB2YXIgb3BlbkZlZWRiYWNrID0gISR0aXBDb250YWluZXIuY2hpbGRyZW4oJy5oNXAtZmVlZGJhY2stZGlhbG9nJykuaXMoJGZlZWRiYWNrRGlhbG9nKTtcbiAgICAgICAgICByZW1vdmVGZWVkYmFja0RpYWxvZygpO1xuXG4gICAgICAgICAgLy8gRG8gbm90IG9wZW4gZmVlZGJhY2sgaWYgaXQgd2FzIG9wZW5cbiAgICAgICAgICBpZiAob3BlbkZlZWRiYWNrKSB7XG4gICAgICAgICAgICAkbXVsdGljaG9pY2VUaXAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGlwIGRpYWxvZ1xuICAgICAgICAgICAgYWRkRmVlZGJhY2soJHRpcENvbnRhaW5lciwgdGlwKTtcbiAgICAgICAgICAgICRmZWVkYmFja0RpYWxvZy5hZGRDbGFzcygnaDVwLWhhcy10aXAnKTtcblxuICAgICAgICAgICAgLy8gVGlwIGZvciByZWFkc3BlYWtlclxuICAgICAgICAgICAgc2VsZi5yZWFkKHRpcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgJG11bHRpY2hvaWNlVGlwLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi50cmlnZ2VyKCdyZXNpemUnKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSB0aXAgZGlhbG9nIG9uIGRvbSBjbGlja1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG15RG9tLmNsaWNrKHJlbW92ZUZlZWRiYWNrRGlhbG9nKTtcbiAgICAgICAgICB9LCAxMDApO1xuXG4gICAgICAgICAgLy8gRG8gbm90IHByb3BhZ2F0ZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkua2V5ZG93bihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChlLndoaWNoID09PSAzMikge1xuICAgICAgICAgICAgJCh0aGlzKS5jbGljaygpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmg1cC1hbHRlcm5hdGl2ZS1jb250YWluZXInLCB0aGlzKS5hcHBlbmQoJHdyYXApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFNldCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICB2YXIgdG9nZ2xlQ2hlY2sgPSBmdW5jdGlvbiAoJGFucykge1xuICAgICAgICBpZiAoJGFucy5hdHRyKCdhcmlhLWRpc2FibGVkJykgPT09ICd0cnVlJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmFuc3dlcmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KCRhbnMuZGF0YSgnaWQnKSk7XG4gICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuICAgICAgICAgIC8vIFN0b3JlIGFuc3dlclxuICAgICAgICAgIHBhcmFtcy51c2VyQW5zd2VycyA9IFtudW1dO1xuXG4gICAgICAgICAgLy8gQ2FsY3VsYXRlIHNjb3JlXG4gICAgICAgICAgc2NvcmUgPSAocGFyYW1zLmFuc3dlcnNbbnVtXS5jb3JyZWN0ID8gMSA6IDApO1xuXG4gICAgICAgICAgLy8gRGUtc2VsZWN0IHByZXZpb3VzIGFuc3dlclxuICAgICAgICAgICRhbnN3ZXJzLm5vdCgkYW5zKS5yZW1vdmVDbGFzcygnaDVwLXNlbGVjdGVkJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKS5hdHRyKCdhcmlhLWNoZWNrZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgIC8vIFNlbGVjdCBuZXcgYW5zd2VyXG4gICAgICAgICAgJGFucy5hZGRDbGFzcygnaDVwLXNlbGVjdGVkJykuYXR0cigndGFiaW5kZXgnLCAnMCcpLmF0dHIoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKCRhbnMuYXR0cignYXJpYS1jaGVja2VkJykgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgY29uc3QgcG9zID0gcGFyYW1zLnVzZXJBbnN3ZXJzLmluZGV4T2YobnVtKTtcbiAgICAgICAgICAgIGlmIChwb3MgIT09IC0xKSB7XG4gICAgICAgICAgICAgIHBhcmFtcy51c2VyQW5zd2Vycy5zcGxpY2UocG9zLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRG8gbm90IGFsbG93IHVuLWNoZWNraW5nIHdoZW4gcmV0cnkgZGlzYWJsZWQgYW5kIGF1dG8gY2hlY2tcbiAgICAgICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLmF1dG9DaGVjayAmJiAhcGFyYW1zLmJlaGF2aW91ci5lbmFibGVSZXRyeSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBjaGVja1xuICAgICAgICAgICAgJGFucy5yZW1vdmVDbGFzcygnaDVwLXNlbGVjdGVkJykuYXR0cignYXJpYS1jaGVja2VkJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzLnB1c2gobnVtKTtcbiAgICAgICAgICAgICRhbnMuYWRkQ2xhc3MoJ2g1cC1zZWxlY3RlZCcpLmF0dHIoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2FsY3VsYXRlIHNjb3JlXG4gICAgICAgICAgY2FsY1Njb3JlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnRyaWdnZXJYQVBJKCdpbnRlcmFjdGVkJyk7XG4gICAgICAgIGhpZGVTb2x1dGlvbigkYW5zKTtcblxuICAgICAgICBpZiAocGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHNlbGYuc2hvd0J1dHRvbignY2hlY2stYW5zd2VyJyk7XG4gICAgICAgICAgc2VsZi5oaWRlQnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICAgICAgICBzZWxmLmhpZGVCdXR0b24oJ3Nob3ctc29sdXRpb24nKTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLmF1dG9DaGVjaykge1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgICAgICAgIC8vIE9ubHkgYSBzaW5nbGUgYW5zd2VyIGFsbG93ZWRcbiAgICAgICAgICAgICAgY2hlY2tBbnN3ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAvLyBTaG93IGZlZWRiYWNrIGZvciBzZWxlY3RlZCBhbHRlcm5hdGl2ZXNcbiAgICAgICAgICAgICAgc2VsZi5zaG93Q2hlY2tTb2x1dGlvbih0cnVlKTtcblxuICAgICAgICAgICAgICAvLyBBbHdheXMgZmluaXNoIHRhc2sgaWYgaXQgd2FzIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgaWYgKHNjb3JlID09PSBzZWxmLmdldE1heFNjb3JlKCkpIHtcbiAgICAgICAgICAgICAgICBjaGVja0Fuc3dlcigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkYW5zd2Vycy5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRvZ2dsZUNoZWNrKCQodGhpcykpO1xuICAgICAgfSkua2V5ZG93bihmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMikgeyAvLyBTcGFjZSBiYXJcbiAgICAgICAgICAvLyBTZWxlY3QgY3VycmVudCBpdGVtXG4gICAgICAgICAgdG9nZ2xlQ2hlY2soJCh0aGlzKSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgMzg6ICAgLy8gVXBcbiAgICAgICAgICAgIGNhc2UgMzc6IHsgLy8gTGVmdFxuICAgICAgICAgICAgICAvLyBUcnkgdG8gc2VsZWN0IHByZXZpb3VzIGl0ZW1cbiAgICAgICAgICAgICAgdmFyICRwcmV2ID0gJCh0aGlzKS5wcmV2KCk7XG4gICAgICAgICAgICAgIGlmICgkcHJldi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVDaGVjaygkcHJldi5mb2N1cygpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIDQwOiAgIC8vIERvd25cbiAgICAgICAgICAgIGNhc2UgMzk6IHsgLy8gUmlnaHRcbiAgICAgICAgICAgICAgLy8gVHJ5IHRvIHNlbGVjdCBuZXh0IGl0ZW1cbiAgICAgICAgICAgICAgdmFyICRuZXh0ID0gJCh0aGlzKS5uZXh0KCk7XG4gICAgICAgICAgICAgIGlmICgkbmV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVDaGVjaygkbmV4dC5mb2N1cygpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgIC8vIFNwZWNpYWwgZm9jdXMgaGFuZGxlciBmb3IgcmFkaW8gYnV0dG9uc1xuICAgICAgICAkYW5zd2Vycy5mb2N1cyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCQodGhpcykuYXR0cignYXJpYS1kaXNhYmxlZCcpICE9PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICRhbnN3ZXJzLm5vdCh0aGlzKS5hdHRyKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuYmx1cihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCEkYW5zd2Vycy5maWx0ZXIoJy5oNXAtc2VsZWN0ZWQnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICRhbnN3ZXJzLmZpcnN0KCkuYWRkKCRhbnN3ZXJzLmxhc3QoKSkuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZHMgY2hlY2sgYW5kIHJldHJ5IGJ1dHRvblxuICAgICAgYWRkQnV0dG9ucygpO1xuICAgICAgaWYgKCFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlcikge1xuXG4gICAgICAgIGNhbGNTY29yZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoICYmIHBhcmFtcy5hbnN3ZXJzW3BhcmFtcy51c2VyQW5zd2Vyc1swXV0uY29ycmVjdCkge1xuICAgICAgICAgIHNjb3JlID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzY29yZSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSGFzIGFuc3dlcmVkIHRocm91Z2ggYXV0by1jaGVjayBpbiBhIHByZXZpb3VzIHNlc3Npb25cbiAgICAgIGlmIChoYXNDaGVja2VkQW5zd2VyICYmIHBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrKSB7XG5cbiAgICAgICAgLy8gQ2hlY2sgYW5zd2VycyBpZiBhbnN3ZXIgaGFzIGJlZW4gZ2l2ZW4gb3IgbWF4IHNjb3JlIHJlYWNoZWRcbiAgICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyIHx8IHNjb3JlID09PSBzZWxmLmdldE1heFNjb3JlKCkpIHtcbiAgICAgICAgICBjaGVja0Fuc3dlcigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIFNob3cgZmVlZGJhY2sgZm9yIGNoZWNrZWQgY2hlY2tib3hlc1xuICAgICAgICAgIHNlbGYuc2hvd0NoZWNrU29sdXRpb24odHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5zaG93QWxsU29sdXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNvbHV0aW9uc1Zpc2libGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc29sdXRpb25zVmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICRteURvbS5maW5kKCcuaDVwLWFuc3dlcicpLmVhY2goZnVuY3Rpb24gKGksIGUpIHtcbiAgICAgICAgdmFyICRlID0gJChlKTtcbiAgICAgICAgdmFyIGEgPSBwYXJhbXMuYW5zd2Vyc1tpXTtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gJ2g1cC1zb2x1dGlvbi1pY29uLScgKyAocGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIgPyAncmFkaW8nIDogJ2NoZWNrYm94Jyk7XG5cbiAgICAgICAgaWYgKGEuY29ycmVjdCkge1xuICAgICAgICAgICRlLmFkZENsYXNzKCdoNXAtc2hvdWxkJykuYXBwZW5kKCQoJzxzcGFuLz4nLCB7XG4gICAgICAgICAgICAnY2xhc3MnOiBjbGFzc05hbWUsXG4gICAgICAgICAgICBodG1sOiBwYXJhbXMuVUkuc2hvdWxkQ2hlY2sgKyAnLidcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgJGUuYWRkQ2xhc3MoJ2g1cC1zaG91bGQtbm90JykuYXBwZW5kKCQoJzxzcGFuLz4nLCB7XG4gICAgICAgICAgICAnY2xhc3MnOiBjbGFzc05hbWUsXG4gICAgICAgICAgICBodG1sOiBwYXJhbXMuVUkuc2hvdWxkTm90Q2hlY2sgKyAnLidcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pLmZpbmQoJy5oNXAtcXVlc3Rpb24tcGx1cy1vbmUsIC5oNXAtcXVlc3Rpb24tbWludXMtb25lJykucmVtb3ZlKCk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBpbnB1dCBpcyBkaXNhYmxlZCBpbiBzb2x1dGlvbiBtb2RlXG4gICAgICBkaXNhYmxlSW5wdXQoKTtcblxuICAgICAgLy8gTW92ZSBmb2N1cyBiYWNrIHRvIHRoZSBmaXJzdCBhbHRlcm5hdGl2ZSBzbyB0aGF0IHRoZSB1c2VyIGJlY29tZXNcbiAgICAgIC8vIGF3YXJlIHRoYXQgdGhlIHNvbHV0aW9uIGlzIGJlaW5nIHNob3duLlxuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtYW5zd2VyOmZpcnN0LWNoaWxkJykuZm9jdXMoKTtcblxuICAgICAgLy9IaWRlIGJ1dHRvbnMgYW5kIHJldHJ5IGRlcGVuZGluZyBvbiBzZXR0aW5ncy5cbiAgICAgIHNlbGYuaGlkZUJ1dHRvbignY2hlY2stYW5zd2VyJyk7XG4gICAgICBzZWxmLmhpZGVCdXR0b24oJ3Nob3ctc29sdXRpb24nKTtcbiAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLmVuYWJsZVJldHJ5KSB7XG4gICAgICAgIHNlbGYuc2hvd0J1dHRvbigndHJ5LWFnYWluJyk7XG4gICAgICB9XG4gICAgICBzZWxmLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIGluIGNvbnRyYWN0cy5cbiAgICAgKiBTaG93cyB0aGUgc29sdXRpb24gZm9yIHRoZSB0YXNrIGFuZCBoaWRlcyBhbGwgYnV0dG9ucy5cbiAgICAgKi9cbiAgICB0aGlzLnNob3dTb2x1dGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZW1vdmVGZWVkYmFja0RpYWxvZygpO1xuICAgICAgc2VsZi5zaG93Q2hlY2tTb2x1dGlvbigpO1xuICAgICAgc2VsZi5zaG93QWxsU29sdXRpb25zKCk7XG4gICAgICBkaXNhYmxlSW5wdXQoKTtcbiAgICAgIHNlbGYuaGlkZUJ1dHRvbigndHJ5LWFnYWluJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEhpZGUgc29sdXRpb24gZm9yIHRoZSBnaXZlbiBhbnN3ZXIocylcbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRhbnN3ZXJcbiAgICAgKi9cbiAgICB2YXIgaGlkZVNvbHV0aW9uID0gZnVuY3Rpb24gKCRhbnN3ZXIpIHtcbiAgICAgICRhbnN3ZXJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtY29ycmVjdCcpXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaDVwLXdyb25nJylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtc2hvdWxkJylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdoNXAtc2hvdWxkLW5vdCcpXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaDVwLWhhcy1mZWVkYmFjaycpXG4gICAgICAgIC5maW5kKCcuaDVwLXF1ZXN0aW9uLXBsdXMtb25lLCAnICtcbiAgICAgICAgICAnLmg1cC1xdWVzdGlvbi1taW51cy1vbmUsICcgK1xuICAgICAgICAgICcuaDVwLWFuc3dlci1pY29uLCAnICtcbiAgICAgICAgICAnLmg1cC1zb2x1dGlvbi1pY29uLXJhZGlvLCAnICtcbiAgICAgICAgICAnLmg1cC1zb2x1dGlvbi1pY29uLWNoZWNrYm94LCAnICtcbiAgICAgICAgICAnLmg1cC1mZWVkYmFjay1kaWFsb2cnKVxuICAgICAgICAucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICovXG4gICAgdGhpcy5oaWRlU29sdXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgc29sdXRpb25zVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICBoaWRlU29sdXRpb24oJCgnLmg1cC1hbnN3ZXInLCAkbXlEb20pKTtcblxuICAgICAgdGhpcy5yZW1vdmVGZWVkYmFjaygpOyAvLyBSZXNldCBmZWVkYmFja1xuXG4gICAgICBzZWxmLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHdob2xlIHRhc2suXG4gICAgICogVXNlZCBpbiBjb250cmFjdHMgd2l0aCBpbnRlZ3JhdGVkIGNvbnRlbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnJlc2V0VGFzayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuYW5zd2VyZWQgPSBmYWxzZTtcbiAgICAgIHNlbGYuaGlkZVNvbHV0aW9ucygpO1xuICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzID0gW107XG4gICAgICByZW1vdmVTZWxlY3Rpb25zKCk7XG4gICAgICBzZWxmLnNob3dCdXR0b24oJ2NoZWNrLWFuc3dlcicpO1xuICAgICAgc2VsZi5oaWRlQnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICAgIHNlbGYuaGlkZUJ1dHRvbignc2hvdy1zb2x1dGlvbicpO1xuICAgICAgZW5hYmxlSW5wdXQoKTtcbiAgICAgICRteURvbS5maW5kKCcuaDVwLWZlZWRiYWNrLWF2YWlsYWJsZScpLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICB2YXIgY2FsY3VsYXRlTWF4U2NvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoYmxhbmtJc0NvcnJlY3QpIHtcbiAgICAgICAgcmV0dXJuIHBhcmFtcy53ZWlnaHQ7XG4gICAgICB9XG4gICAgICB2YXIgbWF4U2NvcmUgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hvaWNlID0gcGFyYW1zLmFuc3dlcnNbaV07XG4gICAgICAgIGlmIChjaG9pY2UuY29ycmVjdCkge1xuICAgICAgICAgIG1heFNjb3JlICs9IChjaG9pY2Uud2VpZ2h0ICE9PSB1bmRlZmluZWQgPyBjaG9pY2Uud2VpZ2h0IDogMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXhTY29yZTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRNYXhTY29yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAoIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyICYmICFwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZVBvaW50ID8gY2FsY3VsYXRlTWF4U2NvcmUoKSA6IHBhcmFtcy53ZWlnaHQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBhbnN3ZXJcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tBbnN3ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBVbmJpbmQgcmVtb3ZhbCBvZiBmZWVkYmFjayBkaWFsb2dzIG9uIGNsaWNrXG4gICAgICAkbXlEb20udW5iaW5kKCdjbGljaycsIHJlbW92ZUZlZWRiYWNrRGlhbG9nKTtcblxuICAgICAgLy8gUmVtb3ZlIGFsbCB0aXAgZGlhbG9nc1xuICAgICAgcmVtb3ZlRmVlZGJhY2tEaWFsb2coKTtcblxuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuZW5hYmxlU29sdXRpb25zQnV0dG9uKSB7XG4gICAgICAgIHNlbGYuc2hvd0J1dHRvbignc2hvdy1zb2x1dGlvbicpO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuZW5hYmxlUmV0cnkpIHtcbiAgICAgICAgc2VsZi5zaG93QnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuaGlkZUJ1dHRvbignY2hlY2stYW5zd2VyJyk7XG5cbiAgICAgIHNlbGYuc2hvd0NoZWNrU29sdXRpb24oKTtcbiAgICAgIGRpc2FibGVJbnB1dCgpO1xuXG4gICAgICB2YXIgeEFQSUV2ZW50ID0gc2VsZi5jcmVhdGVYQVBJRXZlbnRUZW1wbGF0ZSgnYW5zd2VyZWQnKTtcbiAgICAgIGFkZFF1ZXN0aW9uVG9YQVBJKHhBUElFdmVudCk7XG4gICAgICBhZGRSZXNwb25zZVRvWEFQSSh4QVBJRXZlbnQpO1xuICAgICAgc2VsZi50cmlnZ2VyKHhBUElFdmVudCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHVpIGJ1dHRvbnMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB2YXIgYWRkQnV0dG9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkY29udGVudCA9ICQoJ1tkYXRhLWNvbnRlbnQtaWQ9XCInICsgc2VsZi5jb250ZW50SWQgKyAnXCJdLmg1cC1jb250ZW50Jyk7XG4gICAgICB2YXIgJGNvbnRhaW5lclBhcmVudHMgPSAkY29udGVudC5wYXJlbnRzKCcuaDVwLWNvbnRhaW5lcicpO1xuXG4gICAgICAvLyBzZWxlY3QgZmluZCBjb250YWluZXIgdG8gYXR0YWNoIGRpYWxvZ3MgdG9cbiAgICAgIHZhciAkY29udGFpbmVyO1xuICAgICAgaWYgKCRjb250YWluZXJQYXJlbnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAvLyB1c2UgcGFyZW50IGhpZ2hlc3QgdXAgaWYgYW55XG4gICAgICAgICRjb250YWluZXIgPSAkY29udGFpbmVyUGFyZW50cy5sYXN0KCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICgkY29udGVudC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgJGNvbnRhaW5lciA9ICRjb250ZW50O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRjb250YWluZXIgPSAkKGRvY3VtZW50LmJvZHkpO1xuICAgICAgfVxuXG4gICAgICAvLyBTaG93IHNvbHV0aW9uIGJ1dHRvblxuICAgICAgc2VsZi5hZGRCdXR0b24oJ3Nob3ctc29sdXRpb24nLCBwYXJhbXMuVUkuc2hvd1NvbHV0aW9uQnV0dG9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnNob3dTb2x1dGlvbnNSZXF1aXJlc0lucHV0ICYmICFzZWxmLmdldEFuc3dlckdpdmVuKHRydWUpKSB7XG4gICAgICAgICAgLy8gUmVxdWlyZSBhbnN3ZXIgYmVmb3JlIHNvbHV0aW9uIGNhbiBiZSB2aWV3ZWRcbiAgICAgICAgICBzZWxmLnVwZGF0ZUZlZWRiYWNrQ29udGVudChwYXJhbXMuVUkubm9JbnB1dCk7XG4gICAgICAgICAgc2VsZi5yZWFkKHBhcmFtcy5VSS5ub0lucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjYWxjU2NvcmUoKTtcbiAgICAgICAgICBzZWxmLnNob3dBbGxTb2x1dGlvbnMoKTtcbiAgICAgICAgfVxuXG4gICAgICB9LCBmYWxzZSwge1xuICAgICAgICAnYXJpYS1sYWJlbCc6IHBhcmFtcy5VSS5hMTF5U2hvd1NvbHV0aW9uLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIENoZWNrIGJ1dHRvblxuICAgICAgaWYgKHBhcmFtcy5iZWhhdmlvdXIuZW5hYmxlQ2hlY2tCdXR0b24gJiYgKCFwYXJhbXMuYmVoYXZpb3VyLmF1dG9DaGVjayB8fCAhcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpKSB7XG4gICAgICAgIHNlbGYuYWRkQnV0dG9uKCdjaGVjay1hbnN3ZXInLCBwYXJhbXMuVUkuY2hlY2tBbnN3ZXJCdXR0b24sXG4gICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5hbnN3ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBjaGVja0Fuc3dlcigpO1xuICAgICAgICAgICAgJG15RG9tLmZpbmQoJy5oNXAtYW5zd2VyOmZpcnN0LWNoaWxkJykuZm9jdXMoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiBwYXJhbXMuVUkuYTExeUNoZWNrLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uZmlybWF0aW9uRGlhbG9nOiB7XG4gICAgICAgICAgICAgIGVuYWJsZTogcGFyYW1zLmJlaGF2aW91ci5jb25maXJtQ2hlY2tEaWFsb2csXG4gICAgICAgICAgICAgIGwxMG46IHBhcmFtcy5jb25maXJtQ2hlY2ssXG4gICAgICAgICAgICAgIGluc3RhbmNlOiBzZWxmLFxuICAgICAgICAgICAgICAkcGFyZW50RWxlbWVudDogJGNvbnRhaW5lclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnREYXRhOiBzZWxmLmNvbnRlbnREYXRhLFxuICAgICAgICAgICAgdGV4dElmU3VibWl0dGluZzogcGFyYW1zLlVJLnN1Ym1pdEFuc3dlckJ1dHRvbixcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRyeSBBZ2FpbiBidXR0b25cbiAgICAgIHNlbGYuYWRkQnV0dG9uKCd0cnktYWdhaW4nLCBwYXJhbXMuVUkudHJ5QWdhaW5CdXR0b24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5yZXNldFRhc2soKTtcblxuICAgICAgICBpZiAocGFyYW1zLmJlaGF2aW91ci5yYW5kb21BbnN3ZXJzKSB7XG4gICAgICAgICAgLy8gcmVzaHVmZmxlIGFuc3dlcnNcbiAgICAgICAgICB2YXIgb2xkSWRNYXAgPSBpZE1hcDtcbiAgICAgICAgICBpZE1hcCA9IGdldFNodWZmbGVNYXAoKTtcbiAgICAgICAgICB2YXIgYW5zd2Vyc0Rpc3BsYXllZCA9ICRteURvbS5maW5kKCcuaDVwLWFuc3dlcicpO1xuICAgICAgICAgIC8vIHJlbWVtYmVyIHRpcHNcbiAgICAgICAgICB2YXIgdGlwID0gW107XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFuc3dlcnNEaXNwbGF5ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRpcFtpXSA9ICQoYW5zd2Vyc0Rpc3BsYXllZFtpXSkuZmluZCgnLmg1cC1tdWx0aWNob2ljZS10aXB3cmFwJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFRob3NlIHR3byBsb29wcyBjYW5ub3QgYmUgbWVyZ2VkIG9yIHlvdSdsbCBzY3JldyB1cCB5b3VyIHRpcHNcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYW5zd2Vyc0Rpc3BsYXllZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gbW92ZSB0aXBzIGFuZCBhbnN3ZXJzIG9uIGRpc3BsYXlcbiAgICAgICAgICAgICQoYW5zd2Vyc0Rpc3BsYXllZFtpXSkuZmluZCgnLmg1cC1hbHRlcm5hdGl2ZS1pbm5lcicpLmh0bWwocGFyYW1zLmFuc3dlcnNbaV0udGV4dCk7XG4gICAgICAgICAgICAkKHRpcFtpXSkuZGV0YWNoKCkuYXBwZW5kVG8oJChhbnN3ZXJzRGlzcGxheWVkW2lkTWFwLmluZGV4T2Yob2xkSWRNYXBbaV0pXSkuZmluZCgnLmg1cC1hbHRlcm5hdGl2ZS1jb250YWluZXInKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBmYWxzZSwge1xuICAgICAgICAnYXJpYS1sYWJlbCc6IHBhcmFtcy5VSS5hMTF5UmV0cnksXG4gICAgICB9LCB7XG4gICAgICAgIGNvbmZpcm1hdGlvbkRpYWxvZzoge1xuICAgICAgICAgIGVuYWJsZTogcGFyYW1zLmJlaGF2aW91ci5jb25maXJtUmV0cnlEaWFsb2csXG4gICAgICAgICAgbDEwbjogcGFyYW1zLmNvbmZpcm1SZXRyeSxcbiAgICAgICAgICBpbnN0YW5jZTogc2VsZixcbiAgICAgICAgICAkcGFyZW50RWxlbWVudDogJGNvbnRhaW5lclxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIHdoaWNoIGZlZWRiYWNrIHRleHQgdG8gZGlzcGxheVxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3JlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heFxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICB2YXIgZ2V0RmVlZGJhY2tUZXh0ID0gZnVuY3Rpb24gKHNjb3JlLCBtYXgpIHtcbiAgICAgIHZhciByYXRpbyA9IChzY29yZSAvIG1heCk7XG5cbiAgICAgIHZhciBmZWVkYmFjayA9IFF1ZXN0aW9uLmRldGVybWluZU92ZXJhbGxGZWVkYmFjayhwYXJhbXMub3ZlcmFsbEZlZWRiYWNrLCByYXRpbyk7XG5cbiAgICAgIHJldHVybiBmZWVkYmFjay5yZXBsYWNlKCdAc2NvcmUnLCBzY29yZSkucmVwbGFjZSgnQHRvdGFsJywgbWF4KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2hvd3MgZmVlZGJhY2sgb24gdGhlIHNlbGVjdGVkIGZpZWxkcy5cbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbc2tpcEZlZWRiYWNrXSBTa2lwIHNob3dpbmcgZmVlZGJhY2sgaWYgdHJ1ZVxuICAgICAqL1xuICAgIHRoaXMuc2hvd0NoZWNrU29sdXRpb24gPSBmdW5jdGlvbiAoc2tpcEZlZWRiYWNrKSB7XG4gICAgICB2YXIgc2NvcmVQb2ludHM7XG4gICAgICBpZiAoIShwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciB8fCBwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZVBvaW50IHx8ICFwYXJhbXMuYmVoYXZpb3VyLnNob3dTY29yZVBvaW50cykpIHtcbiAgICAgICAgc2NvcmVQb2ludHMgPSBuZXcgUXVlc3Rpb24uU2NvcmVQb2ludHMoKTtcbiAgICAgIH1cblxuICAgICAgJG15RG9tLmZpbmQoJy5oNXAtYW5zd2VyJykuZWFjaChmdW5jdGlvbiAoaSwgZSkge1xuICAgICAgICB2YXIgJGUgPSAkKGUpO1xuICAgICAgICB2YXIgYSA9IHBhcmFtcy5hbnN3ZXJzW2ldO1xuICAgICAgICB2YXIgY2hvc2VuID0gKCRlLmF0dHIoJ2FyaWEtY2hlY2tlZCcpID09PSAndHJ1ZScpO1xuICAgICAgICBpZiAoY2hvc2VuKSB7XG4gICAgICAgICAgaWYgKGEuY29ycmVjdCkge1xuICAgICAgICAgICAgLy8gTWF5IGFscmVhZHkgaGF2ZSBiZWVuIGFwcGxpZWQgYnkgaW5zdGFudCBmZWVkYmFja1xuICAgICAgICAgICAgaWYgKCEkZS5oYXNDbGFzcygnaDVwLWNvcnJlY3QnKSkge1xuICAgICAgICAgICAgICAkZS5hZGRDbGFzcygnaDVwLWNvcnJlY3QnKS5hcHBlbmQoJCgnPHNwYW4vPicsIHtcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnaDVwLWFuc3dlci1pY29uJyxcbiAgICAgICAgICAgICAgICBodG1sOiBwYXJhbXMuVUkuY29ycmVjdEFuc3dlciArICcuJ1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCEkZS5oYXNDbGFzcygnaDVwLXdyb25nJykpIHtcbiAgICAgICAgICAgICAgJGUuYWRkQ2xhc3MoJ2g1cC13cm9uZycpLmFwcGVuZCgkKCc8c3Bhbi8+Jywge1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdoNXAtYW5zd2VyLWljb24nLFxuICAgICAgICAgICAgICAgIGh0bWw6IHBhcmFtcy5VSS53cm9uZ0Fuc3dlciArICcuJ1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNjb3JlUG9pbnRzKSB7XG4gICAgICAgICAgICB2YXIgYWx0ZXJuYXRpdmVDb250YWluZXIgPSAkZVswXS5xdWVyeVNlbGVjdG9yKCcuaDVwLWFsdGVybmF0aXZlLWNvbnRhaW5lcicpO1xuXG4gICAgICAgICAgICBpZiAoIXBhcmFtcy5iZWhhdmlvdXIuYXV0b0NoZWNrIHx8IGFsdGVybmF0aXZlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5oNXAtcXVlc3Rpb24tcGx1cy1vbmUsIC5oNXAtcXVlc3Rpb24tbWludXMtb25lJykgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVDb250YWluZXIuYXBwZW5kQ2hpbGQoc2NvcmVQb2ludHMuZ2V0RWxlbWVudChhLmNvcnJlY3QpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNraXBGZWVkYmFjaykge1xuICAgICAgICAgIGlmIChjaG9zZW4gJiYgYS50aXBzQW5kRmVlZGJhY2suY2hvc2VuRmVlZGJhY2sgIT09IHVuZGVmaW5lZCAmJiBhLnRpcHNBbmRGZWVkYmFjay5jaG9zZW5GZWVkYmFjayAhPT0gJycpIHtcbiAgICAgICAgICAgIGFkZEZlZWRiYWNrKCRlLCBhLnRpcHNBbmRGZWVkYmFjay5jaG9zZW5GZWVkYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCFjaG9zZW4gJiYgYS50aXBzQW5kRmVlZGJhY2subm90Q2hvc2VuRmVlZGJhY2sgIT09IHVuZGVmaW5lZCAmJiBhLnRpcHNBbmRGZWVkYmFjay5ub3RDaG9zZW5GZWVkYmFjayAhPT0gJycpIHtcbiAgICAgICAgICAgIGFkZEZlZWRiYWNrKCRlLCBhLnRpcHNBbmRGZWVkYmFjay5ub3RDaG9zZW5GZWVkYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gRGV0ZXJtaW5lIGZlZWRiYWNrXG4gICAgICB2YXIgbWF4ID0gc2VsZi5nZXRNYXhTY29yZSgpO1xuXG4gICAgICAvLyBEaXNhYmxlIHRhc2sgaWYgbWF4c2NvcmUgaXMgYWNoaWV2ZWRcbiAgICAgIHZhciBmdWxsU2NvcmUgPSAoc2NvcmUgPT09IG1heCk7XG5cbiAgICAgIGlmIChmdWxsU2NvcmUpIHtcbiAgICAgICAgc2VsZi5oaWRlQnV0dG9uKCdjaGVjay1hbnN3ZXInKTtcbiAgICAgICAgc2VsZi5oaWRlQnV0dG9uKCd0cnktYWdhaW4nKTtcbiAgICAgICAgc2VsZi5oaWRlQnV0dG9uKCdzaG93LXNvbHV0aW9uJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3cgZmVlZGJhY2tcbiAgICAgIGlmICghc2tpcEZlZWRiYWNrKSB7XG4gICAgICAgIHRoaXMuc2V0RmVlZGJhY2soZ2V0RmVlZGJhY2tUZXh0KHNjb3JlLCBtYXgpLCBzY29yZSwgbWF4LCBwYXJhbXMuVUkuc2NvcmVCYXJMYWJlbCk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYudHJpZ2dlcigncmVzaXplJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERpc2FibGVzIGNob29zaW5nIG5ldyBpbnB1dC5cbiAgICAgKi9cbiAgICB2YXIgZGlzYWJsZUlucHV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJCgnLmg1cC1hbnN3ZXInLCAkbXlEb20pLmF0dHIoe1xuICAgICAgICAnYXJpYS1kaXNhYmxlZCc6ICd0cnVlJyxcbiAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgfSkucmVtb3ZlQXR0cigncm9sZScpXG4gICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWNoZWNrZWQnKTtcblxuICAgICAgJCgnLmg1cC1hbnN3ZXJzJykucmVtb3ZlQXR0cigncm9sZScpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIG5ldyBpbnB1dC5cbiAgICAgKi9cbiAgICB2YXIgZW5hYmxlSW5wdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuaDVwLWFuc3dlcicsICRteURvbSlcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICdhcmlhLWRpc2FibGVkJzogJ2ZhbHNlJyxcbiAgICAgICAgICAncm9sZSc6IHBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyID8gJ3JhZGlvJyA6ICdjaGVja2JveCcsXG4gICAgICAgIH0pO1xuXG4gICAgICAkKCcuaDVwLWFuc3dlcnMnKS5hdHRyKCdyb2xlJywgcGFyYW1zLnJvbGUpO1xuICAgIH07XG5cbiAgICB2YXIgY2FsY1Njb3JlID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2NvcmUgPSAwO1xuICAgICAgZm9yIChjb25zdCBhbnN3ZXIgb2YgcGFyYW1zLnVzZXJBbnN3ZXJzKSB7XG4gICAgICAgIGNvbnN0IGNob2ljZSA9IHBhcmFtcy5hbnN3ZXJzW2Fuc3dlcl07XG4gICAgICAgIGNvbnN0IHdlaWdodCA9IChjaG9pY2Uud2VpZ2h0ICE9PSB1bmRlZmluZWQgPyBjaG9pY2Uud2VpZ2h0IDogMSk7XG4gICAgICAgIGlmIChjaG9pY2UuY29ycmVjdCkge1xuICAgICAgICAgIHNjb3JlICs9IHdlaWdodDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzY29yZSAtPSB3ZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzY29yZSA8IDApIHtcbiAgICAgICAgc2NvcmUgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKCFwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoICYmIGJsYW5rSXNDb3JyZWN0KSB7XG4gICAgICAgIHNjb3JlID0gcGFyYW1zLndlaWdodDtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZVBvaW50KSB7XG4gICAgICAgIHNjb3JlID0gKDEwMCAqIHNjb3JlIC8gY2FsY3VsYXRlTWF4U2NvcmUoKSkgPj0gcGFyYW1zLmJlaGF2aW91ci5wYXNzUGVyY2VudGFnZSA/IHBhcmFtcy53ZWlnaHQgOiAwO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHNlbGVjdGlvbnMgZnJvbSB0YXNrLlxuICAgICAqL1xuICAgIHZhciByZW1vdmVTZWxlY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRhbnN3ZXJzID0gJCgnLmg1cC1hbnN3ZXInLCAkbXlEb20pXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaDVwLXNlbGVjdGVkJylcbiAgICAgICAgLmF0dHIoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuXG4gICAgICBpZiAoIXBhcmFtcy5iZWhhdmlvdXIuc2luZ2xlQW5zd2VyKSB7XG4gICAgICAgICRhbnN3ZXJzLmF0dHIoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkYW5zd2Vycy5maXJzdCgpLmF0dHIoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IGZvY3VzIHRvIGZpcnN0IG9wdGlvblxuICAgICAgJGFuc3dlcnMuZmlyc3QoKS5mb2N1cygpO1xuXG4gICAgICBjYWxjU2NvcmUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IHhBUEkgZGF0YS5cbiAgICAgKiBDb250cmFjdCB1c2VkIGJ5IHJlcG9ydCByZW5kZXJpbmcgZW5naW5lLlxuICAgICAqXG4gICAgICogQHNlZSBjb250cmFjdCBhdCB7QGxpbmsgaHR0cHM6Ly9oNXAub3JnL2RvY3VtZW50YXRpb24vZGV2ZWxvcGVycy9jb250cmFjdHMjZ3VpZGVzLWhlYWRlci02fVxuICAgICAqL1xuICAgIHRoaXMuZ2V0WEFQSURhdGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgeEFQSUV2ZW50ID0gdGhpcy5jcmVhdGVYQVBJRXZlbnRUZW1wbGF0ZSgnYW5zd2VyZWQnKTtcbiAgICAgIGFkZFF1ZXN0aW9uVG9YQVBJKHhBUElFdmVudCk7XG4gICAgICBhZGRSZXNwb25zZVRvWEFQSSh4QVBJRXZlbnQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdGVtZW50OiB4QVBJRXZlbnQuZGF0YS5zdGF0ZW1lbnRcbiAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZCB0aGUgcXVlc3Rpb24gaXRzZWxmIHRvIHRoZSBkZWZpbml0aW9uIHBhcnQgb2YgYW4geEFQSUV2ZW50XG4gICAgICovXG4gICAgdmFyIGFkZFF1ZXN0aW9uVG9YQVBJID0gZnVuY3Rpb24gKHhBUElFdmVudCkge1xuICAgICAgdmFyIGRlZmluaXRpb24gPSB4QVBJRXZlbnQuZ2V0VmVyaWZpZWRTdGF0ZW1lbnRWYWx1ZShbJ29iamVjdCcsICdkZWZpbml0aW9uJ10pO1xuICAgICAgZGVmaW5pdGlvbi5kZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgLy8gUmVtb3ZlIHRhZ3MsIG11c3Qgd3JhcCBpbiBkaXYgdGFnIGJlY2F1c2UgalF1ZXJ5IDEuOSB3aWxsIGNyYXNoIGlmIHRoZSBzdHJpbmcgaXNuJ3Qgd3JhcHBlZCBpbiBhIHRhZy5cbiAgICAgICAgJ2VuLVVTJzogJCgnPGRpdj4nICsgcGFyYW1zLnF1ZXN0aW9uICsgJzwvZGl2PicpLnRleHQoKVxuICAgICAgfTtcbiAgICAgIGRlZmluaXRpb24udHlwZSA9ICdodHRwOi8vYWRsbmV0Lmdvdi9leHBhcGkvYWN0aXZpdGllcy9jbWkuaW50ZXJhY3Rpb24nO1xuICAgICAgZGVmaW5pdGlvbi5pbnRlcmFjdGlvblR5cGUgPSAnY2hvaWNlJztcbiAgICAgIGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm4gPSBbXTtcbiAgICAgIGRlZmluaXRpb24uY2hvaWNlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWZpbml0aW9uLmNob2ljZXNbaV0gPSB7XG4gICAgICAgICAgJ2lkJzogcGFyYW1zLmFuc3dlcnNbaV0ub3JpZ2luYWxPcmRlciArICcnLFxuICAgICAgICAgICdkZXNjcmlwdGlvbic6IHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0YWdzLCBtdXN0IHdyYXAgaW4gZGl2IHRhZyBiZWNhdXNlIGpRdWVyeSAxLjkgd2lsbCBjcmFzaCBpZiB0aGUgc3RyaW5nIGlzbid0IHdyYXBwZWQgaW4gYSB0YWcuXG4gICAgICAgICAgICAnZW4tVVMnOiAkKCc8ZGl2PicgKyBwYXJhbXMuYW5zd2Vyc1tpXS50ZXh0ICsgJzwvZGl2PicpLnRleHQoKVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHBhcmFtcy5hbnN3ZXJzW2ldLmNvcnJlY3QpIHtcbiAgICAgICAgICBpZiAoIXBhcmFtcy5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLmNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuLmxlbmd0aCkge1xuICAgICAgICAgICAgICBkZWZpbml0aW9uLmNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuWzBdICs9ICdbLF0nO1xuICAgICAgICAgICAgICAvLyBUaGlzIGxvb2tzIGluc2FuZSwgYnV0IGl0J3MgaG93IHlvdSBzZXBhcmF0ZSBtdWx0aXBsZSBhbnN3ZXJzXG4gICAgICAgICAgICAgIC8vIHRoYXQgbXVzdCBhbGwgYmUgY2hvc2VuIHRvIGFjaGlldmUgcGVyZmVjdCBzY29yZS4uLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmluaXRpb24uY29ycmVjdFJlc3BvbnNlc1BhdHRlcm4ucHVzaCgnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZpbml0aW9uLmNvcnJlY3RSZXNwb25zZXNQYXR0ZXJuWzBdICs9IHBhcmFtcy5hbnN3ZXJzW2ldLm9yaWdpbmFsT3JkZXI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVmaW5pdGlvbi5jb3JyZWN0UmVzcG9uc2VzUGF0dGVybi5wdXNoKCcnICsgcGFyYW1zLmFuc3dlcnNbaV0ub3JpZ2luYWxPcmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZCB0aGUgcmVzcG9uc2UgcGFydCB0byBhbiB4QVBJIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1hBUElFdmVudH0geEFQSUV2ZW50XG4gICAgICogIFRoZSB4QVBJIGV2ZW50IHdlIHdpbGwgYWRkIGEgcmVzcG9uc2UgdG9cbiAgICAgKi9cbiAgICB2YXIgYWRkUmVzcG9uc2VUb1hBUEkgPSBmdW5jdGlvbiAoeEFQSUV2ZW50KSB7XG4gICAgICB2YXIgbWF4U2NvcmUgPSBzZWxmLmdldE1heFNjb3JlKCk7XG4gICAgICB2YXIgc3VjY2VzcyA9ICgxMDAgKiBzY29yZSAvIG1heFNjb3JlKSA+PSBwYXJhbXMuYmVoYXZpb3VyLnBhc3NQZXJjZW50YWdlO1xuXG4gICAgICB4QVBJRXZlbnQuc2V0U2NvcmVkUmVzdWx0KHNjb3JlLCBtYXhTY29yZSwgc2VsZiwgdHJ1ZSwgc3VjY2Vzcyk7XG4gICAgICBpZiAocGFyYW1zLnVzZXJBbnN3ZXJzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2FsY1Njb3JlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZSA9ICcnO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMudXNlckFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlICE9PSAnJykge1xuICAgICAgICAgIHJlc3BvbnNlICs9ICdbLF0nO1xuICAgICAgICB9XG4gICAgICAgIHJlc3BvbnNlICs9IGlkTWFwID09PSB1bmRlZmluZWQgPyBwYXJhbXMudXNlckFuc3dlcnNbaV0gOiBpZE1hcFtwYXJhbXMudXNlckFuc3dlcnNbaV1dO1xuICAgICAgfVxuICAgICAgeEFQSUV2ZW50LmRhdGEuc3RhdGVtZW50LnJlc3VsdC5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBtYXAgcG9pbnRpbmcgZnJvbSBvcmlnaW5hbCBhbnN3ZXJzIHRvIHNodWZmbGVkIGFuc3dlcnNcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge251bWJlcltdfSBtYXAgcG9pbnRpbmcgZnJvbSBvcmlnaW5hbCBhbnN3ZXJzIHRvIHNodWZmbGVkIGFuc3dlcnNcbiAgICAgKi9cbiAgICB2YXIgZ2V0U2h1ZmZsZU1hcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHBhcmFtcy5hbnN3ZXJzID0gc2h1ZmZsZUFycmF5KHBhcmFtcy5hbnN3ZXJzKTtcblxuICAgICAgLy8gQ3JlYXRlIGEgbWFwIGZyb20gdGhlIG5ldyBpZCB0byB0aGUgb2xkIG9uZVxuICAgICAgdmFyIGlkTWFwID0gW107XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgcGFyYW1zLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWRNYXBbaV0gPSBwYXJhbXMuYW5zd2Vyc1tpXS5vcmlnaW5hbE9yZGVyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlkTWFwO1xuICAgIH07XG5cbiAgICAvLyBJbml0aWFsaXphdGlvbiBjb2RlXG4gICAgLy8gUmFuZG9taXplIG9yZGVyLCBpZiByZXF1ZXN0ZWRcbiAgICB2YXIgaWRNYXA7XG4gICAgLy8gU3RvcmUgb3JpZ2luYWwgb3JkZXIgaW4gYW5zd2Vyc1xuICAgIGZvciAoaSA9IDA7IGkgPCBwYXJhbXMuYW5zd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgcGFyYW1zLmFuc3dlcnNbaV0ub3JpZ2luYWxPcmRlciA9IGk7XG4gICAgfVxuICAgIGlmIChwYXJhbXMuYmVoYXZpb3VyLnJhbmRvbUFuc3dlcnMpIHtcbiAgICAgIGlkTWFwID0gZ2V0U2h1ZmZsZU1hcCgpO1xuICAgIH1cblxuICAgIC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgc2V0IG9mIHVzZXIgYW5zd2Vycy5cbiAgICBwYXJhbXMudXNlckFuc3dlcnMgPSBbXTtcblxuICAgIC8vIFJlc3RvcmUgcHJldmlvdXMgc3RhdGVcbiAgICBpZiAoY29udGVudERhdGEgJiYgY29udGVudERhdGEucHJldmlvdXNTdGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgIC8vIFJlc3RvcmUgYW5zd2Vyc1xuICAgICAgaWYgKGNvbnRlbnREYXRhLnByZXZpb3VzU3RhdGUuYW5zd2Vycykge1xuICAgICAgICBpZiAoIWlkTWFwKSB7XG4gICAgICAgICAgcGFyYW1zLnVzZXJBbnN3ZXJzID0gY29udGVudERhdGEucHJldmlvdXNTdGF0ZS5hbnN3ZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIFRoZSBhbnN3ZXJzIGhhdmUgYmVlbiBzaHVmZmxlZCwgYW5kIHdlIG11c3QgdXNlIHRoZSBpZCBtYXBwaW5nLlxuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb250ZW50RGF0YS5wcmV2aW91c1N0YXRlLmFuc3dlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgaWRNYXAubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgaWYgKGlkTWFwW2tdID09PSBjb250ZW50RGF0YS5wcmV2aW91c1N0YXRlLmFuc3dlcnNbaV0pIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMudXNlckFuc3dlcnMucHVzaChrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYWxjU2NvcmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFzQ2hlY2tlZEFuc3dlciA9IGZhbHNlO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGNob2ljZXNcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgYW5zID0gcGFyYW1zLmFuc3dlcnNbal07XG5cbiAgICAgIGlmICghcGFyYW1zLmJlaGF2aW91ci5zaW5nbGVBbnN3ZXIpIHtcbiAgICAgICAgLy8gU2V0IHJvbGVcbiAgICAgICAgYW5zLnJvbGUgPSAnY2hlY2tib3gnO1xuICAgICAgICBhbnMudGFiaW5kZXggPSAnMCc7XG4gICAgICAgIGlmIChwYXJhbXMudXNlckFuc3dlcnMuaW5kZXhPZihqKSAhPT0gLTEpIHtcbiAgICAgICAgICBhbnMuY2hlY2tlZCA9ICd0cnVlJztcbiAgICAgICAgICBoYXNDaGVja2VkQW5zd2VyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIFNldCByb2xlXG4gICAgICAgIGFucy5yb2xlID0gJ3JhZGlvJztcblxuICAgICAgICAvLyBEZXRlcm1pbmUgdGFiaW5kZXgsIGNoZWNrZWQgYW5kIGV4dHJhIGNsYXNzZXNcbiAgICAgICAgaWYgKHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAvLyBObyBjb3JyZWN0IGFuc3dlcnNcbiAgICAgICAgICBpZiAoaSA9PT0gMCB8fCBpID09PSBwYXJhbXMuYW5zd2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFucy50YWJpbmRleCA9ICcwJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFyYW1zLnVzZXJBbnN3ZXJzLmluZGV4T2YoaikgIT09IC0xKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyB0aGUgY29ycmVjdCBjaG9pY2VcbiAgICAgICAgICBhbnMudGFiaW5kZXggPSAnMCc7XG4gICAgICAgICAgYW5zLmNoZWNrZWQgPSAndHJ1ZSc7XG4gICAgICAgICAgaGFzQ2hlY2tlZEFuc3dlciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU2V0IGRlZmF1bHRcbiAgICAgIGlmIChhbnMudGFiaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhbnMudGFiaW5kZXggPSAnLTEnO1xuICAgICAgfVxuICAgICAgaWYgKGFucy5jaGVja2VkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYW5zLmNoZWNrZWQgPSAnZmFsc2UnO1xuICAgICAgfVxuICAgIH1cblxuICAgIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5jb3VudGVyID0gKE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5jb3VudGVyID09PSB1bmRlZmluZWQgPyAwIDogTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLmNvdW50ZXIgKyAxKTtcbiAgICBwYXJhbXMucm9sZSA9IChwYXJhbXMuYmVoYXZpb3VyLnNpbmdsZUFuc3dlciA/ICdyYWRpb2dyb3VwJyA6ICdncm91cCcpO1xuICAgIHBhcmFtcy5sYWJlbElkID0gJ2g1cC1tY3EnICsgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLmNvdW50ZXI7XG5cbiAgICAvKipcbiAgICAgKiBQYWNrIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBpbnRlcmFjdGl2aXR5IGludG8gYSBvYmplY3QgdGhhdCBjYW4gYmVcbiAgICAgKiBzZXJpYWxpemVkLlxuICAgICAqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHRoaXMuZ2V0Q3VycmVudFN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHN0YXRlID0ge307XG4gICAgICBpZiAoIWlkTWFwKSB7XG4gICAgICAgIHN0YXRlLmFuc3dlcnMgPSBwYXJhbXMudXNlckFuc3dlcnM7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGFuc3dlcnMgaGF2ZSBiZWVuIHNodWZmbGVkIGFuZCBtdXN0IGJlIG1hcHBlZCBiYWNrIHRvIHRoZWlyXG4gICAgICAgIC8vIG9yaWdpbmFsIElELlxuICAgICAgICBzdGF0ZS5hbnN3ZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLnVzZXJBbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc3RhdGUuYW5zd2Vycy5wdXNoKGlkTWFwW3BhcmFtcy51c2VyQW5zd2Vyc1tpXV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHVzZXIgaGFzIGdpdmVuIGFuIGFuc3dlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lnbm9yZUNoZWNrXSBJZ25vcmUgcmV0dXJuaW5nIHRydWUgZnJvbSBwcmVzc2luZyBcImNoZWNrLWFuc3dlclwiIGJ1dHRvbi5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIGFuc3dlciBpcyBnaXZlblxuICAgICAqL1xuICAgIHRoaXMuZ2V0QW5zd2VyR2l2ZW4gPSBmdW5jdGlvbiAoaWdub3JlQ2hlY2spIHtcbiAgICAgIHZhciBhbnN3ZXJlZCA9IGlnbm9yZUNoZWNrID8gZmFsc2UgOiB0aGlzLmFuc3dlcmVkO1xuICAgICAgcmV0dXJuIGFuc3dlcmVkIHx8IHBhcmFtcy51c2VyQW5zd2Vycy5sZW5ndGggPiAwIHx8IGJsYW5rSXNDb3JyZWN0O1xuICAgIH07XG5cbiAgICB0aGlzLmdldFNjb3JlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNjb3JlO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEg1UC5jcmVhdGVUaXRsZSgodGhpcy5jb250ZW50RGF0YSAmJiB0aGlzLmNvbnRlbnREYXRhLm1ldGFkYXRhICYmIHRoaXMuY29udGVudERhdGEubWV0YWRhdGEudGl0bGUpID8gdGhpcy5jb250ZW50RGF0YS5tZXRhZGF0YS50aXRsZSA6ICdNdWx0aXBsZSBDaG9pY2UnKTtcbiAgICB9O1xuXG4gICAgJChzZWxmLmxvYWRPYnNlcnZlcnMocGFyYW1zKSlcblxuICB9O1xuXG4gIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFF1ZXN0aW9uLnByb3RvdHlwZSk7XG4gIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2U7XG5cbiAgZnVuY3Rpb24gc2FuaXRpemVYTUxTdHJpbmcoeG1sKSB7XG4gICAgcmV0dXJuIHhtbC5yZXBsYWNlKC8mYW1wOy9nLCBcIiZcIikucmVwbGFjZSgvJmd0Oy9nLCBcIj5cIikucmVwbGFjZSgvJmx0Oy9nLCBcIjxcIikucmVwbGFjZSgvJnF1b3Q7L2csIFwiXFxcIlwiKTtcbiAgfVxuXG4gIC8qKlxuICAqIE5vdGF0aW9uIGxvZ2ljXG4gICovXG5cbiAgLyoqXG4gICogTG9hZCBvYmVzZXJ2ZXJzIGZvciBjaGFuZ2VzIGluIHRoZSBkb20sIHNvIHRoYXQgcGFyYW1ldGVycyBvZiB0aGUgdmliZSBjYW4gYmUgdXBkYXRlZCBcbiAgKi9cbiAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLnByb3RvdHlwZS5sb2FkT2JzZXJ2ZXJzID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHRoaXMuaW5zdGFuY2VQYXNzZWQgPSBmYWxzZVxuICAgIC8vIGRvIGFsbCB0aGUgaW1wb3J0YW50IHZpYmUgc3R1ZmYsIHdoZW4gdmliZSBpcyBwcm9wZXJseSBsb2FkZWQgYW5kIGF0dGFjaGVkXG4gICAgdmFyIGRvbUF0dGFjaE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG11dGF0aW9uKSB7XG4gICAgICAgIEFycmF5LmZyb20obXV0YXRpb24uYWRkZWROb2RlcykuZm9yRWFjaChhbiA9PiB7XG4gICAgICAgICAgaWYgKGFuLmNvbnN0cnVjdG9yLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcImVsZW1lbnRcIikpIHtcbiAgICAgICAgICAgIGlmIChhbi5jbGFzc0xpc3QuY29udGFpbnMoXCJoNXAtcXVlc3Rpb24tY29udGVudFwiKSAmJiBhbi5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImg1cC1tdWx0aWNob2ljZVwiKSkge1xuICAgICAgICAgICAgICBpZiAoYW4ucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmg1cC12aWJlLWNvbnRhaW5lclwiKSA9PT0gbnVsbCAmJiAhdGhhdC5pbnN0YW5jZVBhc3NlZCkge1xuICAgICAgICAgICAgICAgIHRoYXQuaW5zdGFuY2VQYXNzZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgdmFyIHZpYmVDb250YWluZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgdmliZUNvbnRhaW5lckRpdi5jbGFzc0xpc3QuYWRkKFwiaDVwLXZpYmUtY29udGFpbmVyXCIpXG4gICAgICAgICAgICAgICAgYW4ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodmliZUNvbnRhaW5lckRpdiwgYW4pXG4gICAgICAgICAgICAgICAgdGhhdC5sb2FkU1ZHKHBhcmFtcylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbi5jbGFzc0xpc3QuY29udGFpbnMoXCJub3RhdGlvblwiKSkge1xuICAgICAgICAgICAgICB0aGF0LmFkanVzdEZyYW1lKGFuKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZG9tQXR0YWNoT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwge1xuICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgc3VidHJlZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiBMb2FkcyBTVkcgZnJvbSBwYXJhbWV0ZXJzXG4gICAqIHBhcmFtcyBtdXN0IGNvbnRhaW46XG4gICAqIC0gcGFyYW1zLnF1ZXN0aW9uX25vdGF0aW9uX2xpc3RcbiAgICogLSBwYXJhbXMuYW5zd2Vyc1tpXS5hbnN3ZXJfbm90YXRpb25cbiAgICogQHBhcmFtIHsqfSBwYXJhbXMgXG4gICAqL1xuICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UucHJvdG90eXBlLmxvYWRTVkcgPSBhc3luYyBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG5cbiAgICB2YXIgcm9vdENvbnRhaW5lclxuICAgIGlmIChwYXJhbXMucXVlc3Rpb25faW5zdGFuY2VfbnVtICE9IHVuZGVmaW5lZCkge1xuICAgICAgcm9vdENvbnRhaW5lciA9IHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnF1ZXN0aW9uLWNvbnRhaW5lclwiKVtwYXJhbXMucXVlc3Rpb25faW5zdGFuY2VfbnVtXVxuICAgICAgaWYgKHJvb3RDb250YWluZXIuZ2V0QXR0cmlidXRlKFwiaW5zdGFuY2UtaWRcIikgPT09IG51bGwpIHtcbiAgICAgICAgcm9vdENvbnRhaW5lci5zZXRBdHRyaWJ1dGUoXCJpbnN0YW5jZS1pZFwiLCBwYXJhbXMucXVlc3Rpb25faW5zdGFuY2VfbnVtKVxuICAgICAgICAvLyB0aGF0LmFjdGl2ZVF1ZXN0aW9uQ29udGFpbmVyT2JzZXJ2ZXIub2JzZXJ2ZShyb290Q29udGFpbmVyLCB7XG4gICAgICAgIC8vICAgYXR0cmlidXRlczogdHJ1ZVxuICAgICAgICAvLyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9pZihyb290Q29udGFpbmVyLmdldEF0dHJpYnV0ZShcImluc3RhbmNlLWlkXCIpID09IHBhcmFtcy5xdWVzdGlvbl9pbnN0YW5jZV9udW0pIHJldHVyblxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByb290Q29udGFpbmVyID0gd2luZG93LmRvY3VtZW50LmJvZHlcbiAgICB9XG5cbiAgICB2YXIgcXVlc3Rpb25fY29udGFpbmVyID0gcm9vdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmg1cC12aWJlLWNvbnRhaW5lclwiKVxuICAgIC8vdGhpcyB3aWxsIHByZXZlbnQgbG9hZGluZyBub24gdmlzaWJsZSBjb250YWluZXJzIChlLmcuIGluIHF1ZXN0aW9uIHNldCwgdmliZS1jb250YWluZXJzIHdpbGwgYXBwZWFyIG9uIGRpZmZlcmVudCBzbGlkZXMpXG4gICAgLy8gaWYgKHJvb3RDb250YWluZXIuY2xvc2VzdChcIi5xdWVzdGlvbi1jb250YWluZXJbc3R5bGU9J2Rpc3BsYXk6IG5vbmU7J1wiKSAhPT0gbnVsbCkgcmV0dXJuXG4gICAgLy8gaWYgKHJvb3RDb250YWluZXIucXVlcnlTZWxlY3RvcihcIi52aWJlLWNvbnRhaW5lclwiKSAhPT0gbnVsbCkgcmV0dXJuXG4gICAgaWYgKHBhcmFtcy5xdWVzdGlvbl9ub3RhdGlvbl9saXN0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMucXVlc3Rpb25fbm90YXRpb25fbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXBhcmFtcy5xdWVzdGlvbl9ub3RhdGlvbl9saXN0W2ldLm5vdGF0aW9uV2lkZ2V0LmluY2x1ZGVzKFwiJmx0Oy9zdmdcIikpIGNvbnRpbnVlIC8vIFRoZSBib3ggZm9yIHRoZSBub3RhdGlvbiBpcyBpbml0aWFsaXplZCBidXQgaXQgaGFzIG5vIHBhcnNhYmxlIHN0cmluZy4gSnVzdCBjaGVja2luZyBpZiBzdmcgdGFnIGV4aXN0c1xuICAgICAgICB2YXIgJHZpYmVRdWVzdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgJHZpYmVRdWVzdGlvbi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCAndmliZUNob2ljZScgKyB0aGlzLmdlbmVyYXRlVUlEKCkpXG4gICAgICAgICR2aWJlUXVlc3Rpb24uY2xhc3NMaXN0LmFkZChcIm5vdGF0aW9uXCIpXG4gICAgICAgIHZhciBzdmdvdXQgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHNhbml0aXplWE1MU3RyaW5nKHBhcmFtcy5xdWVzdGlvbl9ub3RhdGlvbl9saXN0W2ldLm5vdGF0aW9uV2lkZ2V0KSwgXCJ0ZXh0L2h0bWxcIikuYm9keS5maXJzdENoaWxkXG4gICAgICAgIHN2Z291dC5xdWVyeVNlbGVjdG9yQWxsKFwiI21hbmlwdWxhdG9yQ2FudmFzLCAjc2NvcmVSZWN0cywgI2xhYmVsQ2FudmFzLCAjcGhhbnRvbUNhbnZhc1wiKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmUoKSlcbiAgICAgICAgc3Znb3V0ID0gc3Znb3V0LnF1ZXJ5U2VsZWN0b3IoXCIjc3ZnQ29udGFpbmVyXCIpXG4gICAgICAgIHN2Z291dC5xdWVyeVNlbGVjdG9yQWxsKFwiLm1hcmtlZCwgLmxhc3RBZGRlZFwiKS5mb3JFYWNoKG0gPT4ge1xuICAgICAgICAgIG0uY2xhc3NMaXN0LnJlbW92ZShcIm1hcmtlZFwiKVxuICAgICAgICAgIG0uY2xhc3NMaXN0LnJlbW92ZShcImxhc3RBZGRlZFwiKVxuICAgICAgICB9KVxuICAgICAgICAvL3N2Z291dC5xdWVyeVNlbGVjdG9yQWxsKFwic3ZnXCIpLmZvckVhY2goc3ZnID0+IHN2Zy5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKDIuNSlcIilcbiAgICAgICAgJHZpYmVRdWVzdGlvbi5hcHBlbmQoc3Znb3V0KVxuICAgICAgICBxdWVzdGlvbl9jb250YWluZXIuYXBwZW5kQ2hpbGQoJHZpYmVRdWVzdGlvbilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5hbnN3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocGFyYW1zLmFuc3dlcnNbaV0uYW5zd2VyX25vdGF0aW9uICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eU1FSShwYXJhbXMuYW5zd2Vyc1tpXS5hbnN3ZXJfbm90YXRpb24ubm90YXRpb25XaWRnZXQpKSB7XG4gICAgICAgICAgdmFyIHV1aWQgPSB0aGlzLmdlbmVyYXRlVUlEKClcbiAgICAgICAgICB2YXIgJHZpYmVBbnN3ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgICAgJHZpYmVBbnN3ZXIuc2V0QXR0cmlidXRlKFwiaWRcIiwgJ3ZpYmVBbnN3ZXInICsgdXVpZClcbiAgICAgICAgICAkdmliZUFuc3dlci5jbGFzc0xpc3QuYWRkKFwibm90YXRpb25cIilcbiAgICAgICAgICB2YXIgYW5zd2VyQ29udGFpbmVyID0gcm9vdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmg1cC1hbHRlcm5hdGl2ZS1jb250YWluZXJbYW5zd2VyLWlkPSdcIiArIGkudG9TdHJpbmcoKSArIFwiJ1wiKVxuICAgICAgICAgIHZhciBzdmdvdXQgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHNhbml0aXplWE1MU3RyaW5nKHBhcmFtcy5hbnN3ZXJzW2ldLmFuc3dlcl9ub3RhdGlvbi5ub3RhdGlvbldpZGdldCksIFwidGV4dC9odG1sXCIpLmJvZHkuZmlyc3RDaGlsZFxuICAgICAgICAgIHN2Z291dC5xdWVyeVNlbGVjdG9yQWxsKFwiI21hbmlwdWxhdG9yQ2FudmFzLCAjc2NvcmVSZWN0cywgI2xhYmVsQ2FudmFzLCAjcGhhbnRvbUNhbnZhc1wiKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmUoKSlcbiAgICAgICAgICBzdmdvdXQgPSBzdmdvdXQucXVlcnlTZWxlY3RvcihcIiNzdmdDb250YWluZXJcIilcbiAgICAgICAgICBzdmdvdXQucXVlcnlTZWxlY3RvckFsbChcIi5tYXJrZWQsIC5sYXN0QWRkZWRcIikuZm9yRWFjaChtID0+IHtcbiAgICAgICAgICAgIG0uY2xhc3NMaXN0LnJlbW92ZShcIm1hcmtlZFwiKVxuICAgICAgICAgICAgbS5jbGFzc0xpc3QucmVtb3ZlKFwibGFzdEFkZGVkXCIpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvL3N2Z291dC5xdWVyeVNlbGVjdG9yQWxsKFwic3ZnXCIpLmZvckVhY2goc3ZnID0+IHN2Zy5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKDIuNSlcIilcbiAgICAgICAgICAkdmliZUFuc3dlci5hcHBlbmQoc3Znb3V0KVxuICAgICAgICAgIGFuc3dlckNvbnRhaW5lci5hcHBlbmRDaGlsZCgkdmliZUFuc3dlcilcblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmliZUluc3RhbmNlc1xuICB9XG5cbiAgLyoqXG4gICAgICogQWRqdXN0IHNpemVzIGFjY29yZGluZyB0byBkZWZpbml0aW9uLXNjYWxlIGhlaWdodCBvZiBjb250ZW50cyB3aGVuIGFsbCBuZWNlc3NhcnkgY29udGFpbmVycyBhcmUgbG9hZGVkLlxuICAgICAqL1xuICBNdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UucHJvdG90eXBlLmFkanVzdEZyYW1lID0gZnVuY3Rpb24gKHZpYmVDb250YWluZXIpIHtcblxuICAgIHZhciBjb250YWluZXJTVkcgPSB2aWJlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIjc3ZnQ29udGFpbmVyXCIpXG4gICAgaWYgKGNvbnRhaW5lclNWRyAhPT0gbnVsbCkge1xuICAgICAgLy8gdmFyIHZiID0gY29udGFpbmVyU1ZHLnF1ZXJ5U2VsZWN0b3IoXCIjaW50ZXJhY3Rpb25PdmVybGF5XCIpLmdldEF0dHJpYnV0ZShcInZpZXdCb3hcIik/LnNwbGl0KFwiIFwiKS5tYXAocGFyc2VGbG9hdClcbiAgICAgIC8vIGNvbnRhaW5lckhlaWdodCA9ICh2YlszXSAqIDEuMjUpLnRvU3RyaW5nKCkgKyBcInB4XCJcbiAgICAgIC8vIGNvbnRhaW5lclNWRy5zdHlsZS5vdmVyZmxvdyA9IFwiYXV0b1wiXG5cbiAgICAgIGlmICh0aGlzLnRhc2tDb250YWluZXJIZWlnaHQgPT09IDApIHtcbiAgICAgICAgQXJyYXkuZnJvbShjb250YWluZXJTVkcuY2hpbGRyZW4pLmZvckVhY2goYyA9PiB7XG4gICAgICAgICAgaWYgKGMuaWQgPT09IFwic2lkZWJhckNvbnRhaW5lclwiKSByZXR1cm5cbiAgICAgICAgICBpZihjLmlkID09PSBcImludGVyYWN0aW9uT3ZlcmxheVwiKXtcbiAgICAgICAgICAgIGlmKEFycmF5LmZyb20oYy5jaGlsZHJlbikuZXZlcnkoY2hpbGQgPT4gY2hpbGQuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSkgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudGFza0NvbnRhaW5lckhlaWdodCArPSBjLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICB2aWJlQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9ICh0aGlzLnRhc2tDb250YWluZXJIZWlnaHQgKiAxLjMpICsgXCJweFwiIC8vY29udGFpbmVySGVpZ2h0IHx8IFwiMjByZW1cIlxuICAgIHZpYmVDb250YWluZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIlxuXG5cbiAgICAvLyB2YXIgaDVwQ29udGFpbmVyID0gdmliZUNvbnRhaW5lci5wYXJlbnRFbGVtZW50IC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5oNXAtdmliZS1jb250YWluZXJcIilcbiAgICAvLyB2YXIgc2hvd0NoaWxkcmVuID0gaDVwQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudmliZS1jb250YWluZXJcIilcbiAgICAvLyB2YXIgaDVwQ29udGFpbmVySGVpZ2h0ID0gcGFyc2VGbG9hdChoNXBDb250YWluZXIuc3R5bGUuaGVpZ3RoKSB8fCAwXG4gICAgLy8gc2hvd0NoaWxkcmVuLmZvckVhY2goc2MgPT4ge1xuICAgIC8vICAgaDVwQ29udGFpbmVySGVpZ2h0ICs9IHNjLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodFxuICAgIC8vICAgc2Muc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCIgLy8gdmVyeSBpbXBvcnRhbnQsIHNvIHRoYXQgdGhlIGNvbnRhaW5lcnMgYXJlIGRpc3BsYXllZCBpbiB0aGUgc2FtZSBjb2x1bW5cbiAgICAvLyB9KVxuICAgIC8vIGg1cENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBoNXBDb250YWluZXJIZWlnaHQudG9TdHJpbmcoKSArIFwicHhcIlxuICAgIC8vIHdpbmRvdy5mcmFtZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKHBhcnNlRmxvYXQod2luZG93LmZyYW1lRWxlbWVudC5zdHlsZS5oZWlnaHQpICsgaDVwQ29udGFpbmVySGVpZ2h0IC8gMSkudG9TdHJpbmcoKSArIFwicHhcIlxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGdpdmVuIE1FSSBpcyBqdXN0IGVtcHR5LlxuICAgKiBFbXB0eSBtZWFuczogT25seSBvbmUgbGF5ZXIgd2l0aCBvbmUgbVJlc3QuIFRoaXMgaXMgdGhlIGRlZmF1bHQgbm90YXRpb24gc2V0dXAgd2l0aG91dCBjaGFuZ2luZyBhbnl0aGluZy5cbiAgICogQHBhcmFtIHsqfSBtZWkgXG4gICAqIEByZXR1cm5zIFxuICAgKi9cbiAgTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlLnByb3RvdHlwZS5pc0VtcHR5TUVJID0gZnVuY3Rpb24gKG1laSkge1xuICAgIC8vY29udmVydCBzdHJpbmcgZm9yIHByb3BlciBwYXJzaW5nXG4gICAgaWYgKCFtZWkpIHJldHVybiB0cnVlXG4gICAgbWVpID0gbWVpLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTsgLy8gZGVsZXRlIGFsbCB1bm5lY2Vzc2FyeSBuZXdsaW5lXG4gICAgbWVpID0gbWVpLnJlcGxhY2UoL1xcc3syLH0vZywgXCJcIik7IC8vIGRlbGV0ZSBhbGwgdW5uZWNlc3Nhcnkgd2hpdGVzcGFjZXNcbiAgICBtZWkgPSBtZWkucmVwbGFjZSgvJmFtcDsvZywgXCImXCIpLnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLyZsdDsvZywgXCI8XCIpLnJlcGxhY2UoLyZxdW90Oy9nLCBcIlxcXCJcIik7XG5cbiAgICB2YXIgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpXG4gICAgdmFyIHhtbERvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcobWVpLCBcInRleHQveG1sXCIpXG4gICAgcmV0dXJuIHhtbERvYy5xdWVyeVNlbGVjdG9yQWxsKFwibGF5ZXJcIikubGVuZ3RoID09PSAxICYmIHhtbERvYy5xdWVyeVNlbGVjdG9yKFwibGF5ZXIgbVJlc3RcIikgIT09IG51bGxcbiAgfVxuXG4gIE11c2ljTm90YXRpb25NdWx0aUNob2ljZS5wcm90b3R5cGUuZ2VuZXJhdGVVSUQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpcnN0UGFydCA9ICgoTWF0aC5yYW5kb20oKSAqIDQ2NjU2KSB8IDApLnRvU3RyaW5nKDM2KVxuICAgIHZhciBzZWNvbmRQYXJ0ID0gKChNYXRoLnJhbmRvbSgpICogNDY2NTYpIHwgMCkudG9TdHJpbmcoMzYpXG4gICAgZmlyc3RQYXJ0ID0gKFwiMDAwXCIgKyBmaXJzdFBhcnQpLnNsaWNlKC0zKTtcbiAgICBzZWNvbmRQYXJ0ID0gKFwiMDAwXCIgKyBzZWNvbmRQYXJ0KS5zbGljZSgtMyk7XG4gICAgcmV0dXJuIGZpcnN0UGFydCArIHNlY29uZFBhcnQ7XG4gIH1cblxuICByZXR1cm4gTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlXG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBNTk1DIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgXCIuLi9jc3MvbXVzaWNub3RhdGlvbi1tdWx0aWNob2ljZS5jc3NcIlxuaW1wb3J0IE1OTUMgZnJvbSBcIi4uL2pzL211c2ljbm90YXRpb24tbXVsdGljaG9pY2UuanNcIlxuXG4vLyBMb2FkIGxpYnJhcnlcbkg1UCA9IEg1UCB8fCB7fTtcbkg1UC5NdXNpY05vdGF0aW9uTXVsdGlDaG9pY2UgPSBNTk1DO1xuIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkg1UCIsImpRdWVyeSIsIkpvdWJlbFVJIiwiUXVlc3Rpb24iLCJzaHVmZmxlQXJyYXkiLCIkIiwiVUkiLCJNTk1DIiwiTXVzaWNOb3RhdGlvbk11bHRpQ2hvaWNlIiwib3B0aW9ucyIsImNvbnRlbnRJZCIsImNvbnRlbnREYXRhIiwic2VsZiIsImNhbGwiLCJ0YXNrQ29udGFpbmVySGVpZ2h0IiwiZGVmYXVsdHMiLCJpbWFnZSIsInF1ZXN0aW9uIiwiYW5zd2VycyIsInRpcHNBbmRGZWVkYmFjayIsInRpcCIsImNob3NlbkZlZWRiYWNrIiwibm90Q2hvc2VuRmVlZGJhY2siLCJ0ZXh0IiwiY29ycmVjdCIsIm92ZXJhbGxGZWVkYmFjayIsIndlaWdodCIsInVzZXJBbnN3ZXJzIiwiY2hlY2tBbnN3ZXJCdXR0b24iLCJzdWJtaXRBbnN3ZXJCdXR0b24iLCJzaG93U29sdXRpb25CdXR0b24iLCJ0cnlBZ2FpbkJ1dHRvbiIsInNjb3JlQmFyTGFiZWwiLCJ0aXBBdmFpbGFibGUiLCJmZWVkYmFja0F2YWlsYWJsZSIsInJlYWRGZWVkYmFjayIsInNob3VsZENoZWNrIiwic2hvdWxkTm90Q2hlY2siLCJub0lucHV0IiwiYTExeUNoZWNrIiwiYTExeVNob3dTb2x1dGlvbiIsImExMXlSZXRyeSIsImJlaGF2aW91ciIsImVuYWJsZVJldHJ5IiwiZW5hYmxlU29sdXRpb25zQnV0dG9uIiwiZW5hYmxlQ2hlY2tCdXR0b24iLCJ0eXBlIiwic2luZ2xlUG9pbnQiLCJyYW5kb21BbnN3ZXJzIiwic2hvd1NvbHV0aW9uc1JlcXVpcmVzSW5wdXQiLCJhdXRvQ2hlY2siLCJwYXNzUGVyY2VudGFnZSIsInNob3dTY29yZVBvaW50cyIsInBhcmFtcyIsImV4dGVuZCIsImNvbnNvbGUiLCJsb2ciLCJudW1Db3JyZWN0IiwiaSIsImxlbmd0aCIsImFuc3dlciIsImJsYW5rSXNDb3JyZWN0Iiwic2luZ2xlQW5zd2VyIiwiZ2V0Q2hlY2tib3hPclJhZGlvSWNvbiIsInJhZGlvIiwic2VsZWN0ZWQiLCJpY29uIiwiJG15RG9tIiwiJGZlZWRiYWNrRGlhbG9nIiwicmVtb3ZlRmVlZGJhY2tEaWFsb2ciLCJ1bmJpbmQiLCJmaW5kIiwicmVtb3ZlIiwicmVtb3ZlQ2xhc3MiLCJzY29yZSIsInNvbHV0aW9uc1Zpc2libGUiLCJhZGRGZWVkYmFjayIsIiRlbGVtZW50IiwiZmVlZGJhY2siLCJhcHBlbmRUbyIsImFkZENsYXNzIiwicmVnaXN0ZXJEb21FbGVtZW50cyIsIm1lZGlhIiwibGlicmFyeSIsInNwbGl0IiwiZmlsZSIsInNldEltYWdlIiwicGF0aCIsImRpc2FibGVJbWFnZVpvb21pbmciLCJhbHQiLCJ0aXRsZSIsInNvdXJjZXMiLCJzZXRWaWRlbyIsImZpbGVzIiwic2V0QXVkaW8iLCJjaGVja2JveE9yUmFkaW9JY29uIiwiaW5kZXhPZiIsInNldEludHJvZHVjdGlvbiIsImxhYmVsSWQiLCJyb2xlIiwidGFiaW5kZXgiLCJjaGVja2VkIiwiaHRtbCIsInRvU3RyaW5nIiwic2V0Q29udGVudCIsIiRhbnN3ZXJzIiwiZWFjaCIsInVuZGVmaW5lZCIsInRyaW0iLCJ0aXBDb250ZW50IiwicmVwbGFjZSIsIiR3cmFwIiwiJG11bHRpY2hvaWNlVGlwIiwidGlwc0xhYmVsIiwidGlwSWNvbkh0bWwiLCJhcHBlbmQiLCJjbGljayIsIiR0aXBDb250YWluZXIiLCJwYXJlbnRzIiwib3BlbkZlZWRiYWNrIiwiY2hpbGRyZW4iLCJpcyIsImF0dHIiLCJyZWFkIiwidHJpZ2dlciIsInNldFRpbWVvdXQiLCJrZXlkb3duIiwiZSIsIndoaWNoIiwidG9nZ2xlQ2hlY2siLCIkYW5zIiwiYW5zd2VyZWQiLCJudW0iLCJwYXJzZUludCIsImRhdGEiLCJub3QiLCJwb3MiLCJzcGxpY2UiLCJwdXNoIiwiY2FsY1Njb3JlIiwidHJpZ2dlclhBUEkiLCJoaWRlU29sdXRpb24iLCJzaG93QnV0dG9uIiwiaGlkZUJ1dHRvbiIsImNoZWNrQW5zd2VyIiwic2hvd0NoZWNrU29sdXRpb24iLCJnZXRNYXhTY29yZSIsImtleUNvZGUiLCIkcHJldiIsInByZXYiLCJmb2N1cyIsIiRuZXh0IiwibmV4dCIsImJsdXIiLCJmaWx0ZXIiLCJmaXJzdCIsImFkZCIsImxhc3QiLCJhZGRCdXR0b25zIiwiaGFzQ2hlY2tlZEFuc3dlciIsInNob3dBbGxTb2x1dGlvbnMiLCIkZSIsImEiLCJjbGFzc05hbWUiLCJkaXNhYmxlSW5wdXQiLCJzaG93U29sdXRpb25zIiwiJGFuc3dlciIsImhpZGVTb2x1dGlvbnMiLCJyZW1vdmVGZWVkYmFjayIsInJlc2V0VGFzayIsInJlbW92ZVNlbGVjdGlvbnMiLCJlbmFibGVJbnB1dCIsImNhbGN1bGF0ZU1heFNjb3JlIiwibWF4U2NvcmUiLCJjaG9pY2UiLCJ4QVBJRXZlbnQiLCJjcmVhdGVYQVBJRXZlbnRUZW1wbGF0ZSIsImFkZFF1ZXN0aW9uVG9YQVBJIiwiYWRkUmVzcG9uc2VUb1hBUEkiLCIkY29udGVudCIsIiRjb250YWluZXJQYXJlbnRzIiwiJGNvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImFkZEJ1dHRvbiIsImdldEFuc3dlckdpdmVuIiwidXBkYXRlRmVlZGJhY2tDb250ZW50IiwiY29uZmlybWF0aW9uRGlhbG9nIiwiZW5hYmxlIiwiY29uZmlybUNoZWNrRGlhbG9nIiwibDEwbiIsImNvbmZpcm1DaGVjayIsImluc3RhbmNlIiwiJHBhcmVudEVsZW1lbnQiLCJ0ZXh0SWZTdWJtaXR0aW5nIiwib2xkSWRNYXAiLCJpZE1hcCIsImdldFNodWZmbGVNYXAiLCJhbnN3ZXJzRGlzcGxheWVkIiwiZGV0YWNoIiwiY29uZmlybVJldHJ5RGlhbG9nIiwiY29uZmlybVJldHJ5IiwiZ2V0RmVlZGJhY2tUZXh0IiwibWF4IiwicmF0aW8iLCJkZXRlcm1pbmVPdmVyYWxsRmVlZGJhY2siLCJza2lwRmVlZGJhY2siLCJzY29yZVBvaW50cyIsIlNjb3JlUG9pbnRzIiwiY2hvc2VuIiwiaGFzQ2xhc3MiLCJjb3JyZWN0QW5zd2VyIiwid3JvbmdBbnN3ZXIiLCJhbHRlcm5hdGl2ZUNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJhcHBlbmRDaGlsZCIsImdldEVsZW1lbnQiLCJmdWxsU2NvcmUiLCJzZXRGZWVkYmFjayIsInJlbW92ZUF0dHIiLCJnZXRYQVBJRGF0YSIsInN0YXRlbWVudCIsImRlZmluaXRpb24iLCJnZXRWZXJpZmllZFN0YXRlbWVudFZhbHVlIiwiZGVzY3JpcHRpb24iLCJpbnRlcmFjdGlvblR5cGUiLCJjb3JyZWN0UmVzcG9uc2VzUGF0dGVybiIsImNob2ljZXMiLCJvcmlnaW5hbE9yZGVyIiwic3VjY2VzcyIsInNldFNjb3JlZFJlc3VsdCIsInJlc3BvbnNlIiwicmVzdWx0IiwicHJldmlvdXNTdGF0ZSIsImsiLCJqIiwiYW5zIiwiY291bnRlciIsImdldEN1cnJlbnRTdGF0ZSIsInN0YXRlIiwiaWdub3JlQ2hlY2siLCJnZXRTY29yZSIsImdldFRpdGxlIiwiY3JlYXRlVGl0bGUiLCJtZXRhZGF0YSIsImxvYWRPYnNlcnZlcnMiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsInNhbml0aXplWE1MU3RyaW5nIiwieG1sIiwidGhhdCIsImluc3RhbmNlUGFzc2VkIiwiZG9tQXR0YWNoT2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwibXV0YXRpb25zIiwiZm9yRWFjaCIsIm11dGF0aW9uIiwiQXJyYXkiLCJmcm9tIiwiYWRkZWROb2RlcyIsImFuIiwibmFtZSIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInBhcmVudEVsZW1lbnQiLCJ2aWJlQ29udGFpbmVyRGl2IiwiY3JlYXRlRWxlbWVudCIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJsb2FkU1ZHIiwiYWRqdXN0RnJhbWUiLCJvYnNlcnZlIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsInJvb3RDb250YWluZXIiLCJxdWVzdGlvbl9pbnN0YW5jZV9udW0iLCJ3aW5kb3ciLCJxdWVyeVNlbGVjdG9yQWxsIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwicXVlc3Rpb25fY29udGFpbmVyIiwicXVlc3Rpb25fbm90YXRpb25fbGlzdCIsIm5vdGF0aW9uV2lkZ2V0IiwiJHZpYmVRdWVzdGlvbiIsImdlbmVyYXRlVUlEIiwic3Znb3V0IiwiRE9NUGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwiZmlyc3RDaGlsZCIsImMiLCJtIiwiYW5zd2VyX25vdGF0aW9uIiwiaXNFbXB0eU1FSSIsInV1aWQiLCIkdmliZUFuc3dlciIsImFuc3dlckNvbnRhaW5lciIsInZpYmVJbnN0YW5jZXMiLCJ2aWJlQ29udGFpbmVyIiwiY29udGFpbmVyU1ZHIiwiaWQiLCJldmVyeSIsImNoaWxkIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaGVpZ2h0Iiwic3R5bGUiLCJ3aWR0aCIsIm1laSIsInBhcnNlciIsInhtbERvYyIsImZpcnN0UGFydCIsIk1hdGgiLCJyYW5kb20iLCJzZWNvbmRQYXJ0Iiwic2xpY2UiXSwic291cmNlUm9vdCI6IiJ9