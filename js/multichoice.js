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
import {
  jQuery as $, JoubelUI as UI, Question, shuffleArray
}
  from "./globals";

const MCS4L = (function () {

  /**
   * @param {*} options 
   * @param {*} contentId 
   * @param {*} contentData 
   * @returns 
   */
  function MultiChoiceScore4LMS(options, contentId, contentData) {
    if (!(this instanceof MultiChoiceScore4LMS))
      return new MultiChoiceScore4LMS(options, contentId, contentData);
    var self = this;
    this.contentId = contentId;
    this.contentData = contentData;
    Question.call(self, 'multichoice');

    var defaults = {
      image: null,
      question: "No question text provided",
      answers: [
        {
          tipsAndFeedback: {
            tip: '',
            chosenFeedback: '',
            notChosenFeedback: ''
          },
          text: "Answer 1",
          correct: true
        }
      ],
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
        a11yRetry: 'Retry the task. Reset all responses and start the task over again.',
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
    var params = $.extend(true, defaults, options);

    console.log("Multichoice", params)

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
    var blankIsCorrect = (numCorrect === 0);

    // Determine task type
    if (params.behaviour.type === 'auto') {
      // Use single choice if only one choice is correct
      params.behaviour.singleAnswer = (numCorrect === 1);
    }
    else {
      params.behaviour.singleAnswer = (params.behaviour.type === 'single');
    }

    var getCheckboxOrRadioIcon = function (radio, selected) {
      var icon;
      if (radio) {
        icon = selected ? '&#xe603;' : '&#xe600;';
      }
      else {
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
      $feedbackDialog = $('' +
        '<div class="h5p-feedback-dialog">' +
        '<div class="h5p-feedback-inner">' +
        '<div class="h5p-feedback-text">' + feedback + '</div>' +
        '</div>' +
        '</div>');

      //make sure feedback is only added once
      if (!$element.find($('.h5p-feedback-dialog')).length) {
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
        }
        else if (type === 'H5P.Video') {
          if (media.params.sources) {
            // Register task video
            self.setVideo(media);
          }
        }
        else if (type === 'H5P.Audio') {
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
      $myDom = $('<ul>', {
        'class': 'h5p-answers',
        role: params.role,
        'aria-labelledby': params.labelId
      });

      for (let i = 0; i < params.answers.length; i++) {
        const answer = params.answers[i];
        $('<li>', {
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
      var $answers = $('.h5p-answer', $myDom).each(function (i) {

        var tip = params.answers[i].tipsAndFeedback.tip;
        if (tip === undefined) {
          return; // No tip
        }

        tip = tip.trim();
        var tipContent = tip
          .replace(/&nbsp;/g, '')
          .replace(/<p>/g, '')
          .replace(/<\/p>/g, '')
          .trim();
        if (!tipContent.length) {
          return; // Empty tip
        }
        else {
          $(this).addClass('h5p-has-tip');
        }

        // Add tip
        var $wrap = $('<div/>', {
          'class': 'h5p-multichoice-tipwrap',
          'aria-label': params.UI.tipAvailable + '.'
        });

        var $multichoiceTip = $('<div>', {
          'role': 'button',
          'tabindex': 0,
          'title': params.UI.tipsLabel,
          'aria-label': params.UI.tipsLabel,
          'aria-expanded': false,
          'class': 'multichoice-tip',
          appendTo: $wrap
        });

        var tipIconHtml = '<span class="joubel-icon-tip-normal">' +
          '<span class="h5p-icon-shadow"></span>' +
          '<span class="h5p-icon-speech-bubble"></span>' +
          '<span class="h5p-icon-info"></span>' +
          '</span>';

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
          }
          else {
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
            $(this).click();
            return false;
          }
        });

        $('.h5p-alternative-container', this).append($wrap);
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
          score = (params.answers[num].correct ? 1 : 0);

          // De-select previous answer
          $answers.not($ans).removeClass('h5p-selected').attr('tabindex', '-1').attr('aria-checked', 'false');

          // Select new answer
          $ans.addClass('h5p-selected').attr('tabindex', '0').attr('aria-checked', 'true');
        }
        else {
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
          }
          else {
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
            }
            else {
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
        toggleCheck($(this));
      }).keydown(function (e) {
        if (e.keyCode === 32) { // Space bar
          // Select current item
          toggleCheck($(this));
          return false;
        }

        if (params.behaviour.singleAnswer) {
          switch (e.keyCode) {
            case 38:   // Up
            case 37: { // Left
              // Try to select previous item
              var $prev = $(this).prev();
              if ($prev.length) {
                toggleCheck($prev.focus());
              }
              return false;
            }
            case 40:   // Down
            case 39: { // Right
              // Try to select next item
              var $next = $(this).next();
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
          if ($(this).attr('aria-disabled') !== 'true') {
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
      }
      else {
        if (params.userAnswers.length && params.answers[params.userAnswers[0]].correct) {
          score = 1;
        }
        else {
          score = 0;
        }
      }

      // Has answered through auto-check in a previous session
      if (hasCheckedAnswer && params.behaviour.autoCheck) {

        // Check answers if answer has been given or max score reached
        if (params.behaviour.singleAnswer || score === self.getMaxScore()) {
          checkAnswer();
        }
        else {
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
        var $e = $(e);
        var a = params.answers[i];
        const className = 'h5p-solution-icon-' + (params.behaviour.singleAnswer ? 'radio' : 'checkbox');

        if (a.correct) {
          $e.addClass('h5p-should').append($('<span/>', {
            'class': className,
            html: params.UI.shouldCheck + '.'
          }));
        }
        else {
          $e.addClass('h5p-should-not').append($('<span/>', {
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
      $answer
        .removeClass('h5p-correct')
        .removeClass('h5p-wrong')
        .removeClass('h5p-should')
        .removeClass('h5p-should-not')
        .removeClass('h5p-has-feedback')
        .find('.h5p-question-plus-one, ' +
          '.h5p-question-minus-one, ' +
          '.h5p-answer-icon, ' +
          '.h5p-solution-icon-radio, ' +
          '.h5p-solution-icon-checkbox, ' +
          '.h5p-feedback-dialog')
        .remove();
    };

    /**
     *
     */
    this.hideSolutions = function () {
      solutionsVisible = false;

      hideSolution($('.h5p-answer', $myDom));

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
          maxScore += (choice.weight !== undefined ? choice.weight : 1);
        }
      }
      return maxScore;
    };

    this.getMaxScore = function () {
      return (!params.behaviour.singleAnswer && !params.behaviour.singlePoint ? calculateMaxScore() : params.weight);
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
      var $content = $('[data-content-id="' + self.contentId + '"].h5p-content');
      var $containerParents = $content.parents('.h5p-container');

      // select find container to attach dialogs to
      var $container;
      if ($containerParents.length !== 0) {
        // use parent highest up if any
        $container = $containerParents.last();
      }
      else if ($content.length !== 0) {
        $container = $content;
      }
      else {
        $container = $(document.body);
      }

      // Show solution button
      self.addButton('show-solution', params.UI.showSolutionButton, function () {
        if (params.behaviour.showSolutionsRequiresInput && !self.getAnswerGiven(true)) {
          // Require answer before solution can be viewed
          self.updateFeedbackContent(params.UI.noInput);
          self.read(params.UI.noInput);
        }
        else {
          calcScore();
          self.showAllSolutions();
        }

      }, false, {
        'aria-label': params.UI.a11yShowSolution,
      });

      // Check button
      if (params.behaviour.enableCheckButton && (!params.behaviour.autoCheck || !params.behaviour.singleAnswer)) {
        self.addButton('check-answer', params.UI.checkAnswerButton,
          function () {
            self.answered = true;
            checkAnswer();
            $myDom.find('.h5p-answer:first-child').focus();
          },
          true,
          {
            'aria-label': params.UI.a11yCheck,
          },
          {
            confirmationDialog: {
              enable: params.behaviour.confirmCheckDialog,
              l10n: params.confirmCheck,
              instance: self,
              $parentElement: $container
            },
            contentData: self.contentData,
            textIfSubmitting: params.UI.submitAnswerButton,
          }
        );
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
            tip[i] = $(answersDisplayed[i]).find('.h5p-multichoice-tipwrap');
          }
          // Those two loops cannot be merged or you'll screw up your tips
          for (i = 0; i < answersDisplayed.length; i++) {
            // move tips and answers on display
            $(answersDisplayed[i]).find('.h5p-alternative-inner').html(params.answers[i].text);
            $(tip[i]).detach().appendTo($(answersDisplayed[idMap.indexOf(oldIdMap[i])]).find('.h5p-alternative-container'));
          }
        }
      }, false, {
        'aria-label': params.UI.a11yRetry,
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
      var ratio = (score / max);

      var feedback = Question.determineOverallFeedback(params.overallFeedback, ratio);

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
        scorePoints = new Question.ScorePoints();
      }

      $myDom.find('.h5p-answer').each(function (i, e) {
        var $e = $(e);
        var a = params.answers[i];
        var chosen = ($e.attr('aria-checked') === 'true');
        if (chosen) {
          if (a.correct) {
            // May already have been applied by instant feedback
            if (!$e.hasClass('h5p-correct')) {
              $e.addClass('h5p-correct').append($('<span/>', {
                'class': 'h5p-answer-icon',
                html: params.UI.correctAnswer + '.'
              }));
            }
          }
          else {
            if (!$e.hasClass('h5p-wrong')) {
              $e.addClass('h5p-wrong').append($('<span/>', {
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
          }
          else if (!chosen && a.tipsAndFeedback.notChosenFeedback !== undefined && a.tipsAndFeedback.notChosenFeedback !== '') {
            addFeedback($e, a.tipsAndFeedback.notChosenFeedback);
          }
        }
      });

      // Determine feedback
      var max = self.getMaxScore();

      // Disable task if maxscore is achieved
      var fullScore = (score === max);

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
      $('.h5p-answer', $myDom).attr({
        'aria-disabled': 'true',
        'tabindex': '-1'
      }).removeAttr('role')
        .removeAttr('aria-checked');

      $('.h5p-answers').removeAttr('role');
    };

    /**
     * Enables new input.
     */
    var enableInput = function () {
      $('.h5p-answer', $myDom)
        .attr({
          'aria-disabled': 'false',
          'role': params.behaviour.singleAnswer ? 'radio' : 'checkbox',
        });

      $('.h5p-answers').attr('role', params.role);
    };

    var calcScore = function () {
      score = 0;
      for (const answer of params.userAnswers) {
        const choice = params.answers[answer];
        const weight = (choice.weight !== undefined ? choice.weight : 1);
        if (choice.correct) {
          score += weight;
        }
        else {
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
        score = (100 * score / calculateMaxScore()) >= params.behaviour.passPercentage ? params.weight : 0;
      }
    };

    /**
     * Removes selections from task.
     */
    var removeSelections = function () {
      var $answers = $('.h5p-answer', $myDom)
        .removeClass('h5p-selected')
        .attr('aria-checked', 'false');

      if (!params.behaviour.singleAnswer) {
        $answers.attr('tabindex', '0');
      }
      else {
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
        'en-US': $('<div>' + params.question + '</div>').text()
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
            'en-US': $('<div>' + params.answers[i].text + '</div>').text()
          }
        };
        if (params.answers[i].correct) {
          if (!params.singleAnswer) {
            if (definition.correctResponsesPattern.length) {
              definition.correctResponsesPattern[0] += '[,]';
              // This looks insane, but it's how you separate multiple answers
              // that must all be chosen to achieve perfect score...
            }
            else {
              definition.correctResponsesPattern.push('');
            }
            definition.correctResponsesPattern[0] += params.answers[i].originalOrder;
          }
          else {
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
      var success = (100 * score / maxScore) >= params.behaviour.passPercentage;

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
      params.answers = shuffleArray(params.answers);

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
        }
        else {
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
      }
      else {
        // Set role
        ans.role = 'radio';

        // Determine tabindex, checked and extra classes
        if (params.userAnswers.length === 0) {
          // No correct answers
          if (i === 0 || i === params.answers.length) {
            ans.tabindex = '0';
          }
        }
        else if (params.userAnswers.indexOf(j) !== -1) {
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

    MultiChoiceScore4LMS.counter = (MultiChoiceScore4LMS.counter === undefined ? 0 : MultiChoiceScore4LMS.counter + 1);
    params.role = (params.behaviour.singleAnswer ? 'radiogroup' : 'group');
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
      }
      else {
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
      return H5P.createTitle((this.contentData && this.contentData.metadata && this.contentData.metadata.title) ? this.contentData.metadata.title : 'Multiple Choice');
    };

    $(self.loadObservers(params))

  };

  MultiChoiceScore4LMS.prototype = Object.create(Question.prototype);
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
    var that = this
    this.instancePassed = false
    // do all the important vse stuff, when vse is properly loaded and attached
    var domAttachObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.from(mutation.addedNodes).forEach(an => {
          if (an.constructor.name.toLowerCase().includes("element")) {
            if (an.classList.contains("h5p-question-content") && an.parentElement.classList.contains("h5p-multichoice")) {
              if (an.parentElement.querySelector(".h5p-vse-container") === null && !that.instancePassed) {
                that.instancePassed = true
                var vseContainerDiv = document.createElement("div")
                vseContainerDiv.classList.add("h5p-vse-container")
                an.parentNode.insertBefore(vseContainerDiv, an)
                that.loadSVG(params)
              }
            } 
          }
        })
      });
    });

    domAttachObserver.observe(document, {
      childList: true,
      subtree: true
    });
  }



  /**
   * Loads SVG from parameters
   * params must contain:
   * - params.question_notation_list
   * - params.answers[i].answer_notation
   * @param {*} params 
   */
  MultiChoiceScore4LMS.prototype.loadSVG = async function (params) {
    var that = this

    var rootContainer
    if (params.question_instance_num != undefined) {
      rootContainer = window.document.querySelectorAll(".question-container")[params.question_instance_num]
      if (rootContainer.getAttribute("instance-id") === null) {
        rootContainer.setAttribute("instance-id", params.question_instance_num)
        // that.activeQuestionContainerObserver.observe(rootContainer, {
        //   attributes: true
        // })
      } else {
        //if(rootContainer.getAttribute("instance-id") == params.question_instance_num) return
      }
    } else {
      rootContainer = window.document.body
    }

    var question_container = rootContainer.querySelector(".h5p-vse-container")
    //this will prevent loading non visible containers (e.g. in question set, vse-containers will appear on different slides)
    // if (rootContainer.closest(".question-container[style='display: none;'") !== null) return
    // if (rootContainer.querySelector(".vse-container") !== null) return
    if (params.question_notation_list != undefined) {
      for (var i = 0; i < params.question_notation_list.length; i++) {
        var $vseChoice = document.createElement("div")
        $vseChoice.setAttribute("id", 'vseChoice' + this.generateUID())
        var svgout = new DOMParser().parseFromString(sanitizeXMLString(params.question_notation_list[i].notationWidget), "text/html").body.firstChild
        svgout.querySelectorAll("#manipulatorCanvas, #scoreRects, #labelCanvas, #phantomCanvas").forEach(c => c.remove())
        svgout.querySelectorAll(".marked, .lastAdded").forEach(m => {
          m.classList.remove("marked")
          m.classList.remove("lastAdded")
        })
        svgout.querySelectorAll("svg").forEach(svg => svg.style.transform = "scale(2.5)")
        $vseChoice.append(svgout)
        question_container.appendChild($vseChoice)
      }
    }

    for (var i = 0; i < params.answers.length; i++) {
      if (params.answers[i].answer_notation != undefined) {
        if (!this.isEmptyMEI(params.answers[i].answer_notation.notationWidget)) {
          var uuid = this.generateUID()
          var $vseAnswer = document.createElement("div")
          $vseAnswer.setAttribute("id", 'vseAnswer' + uuid)
          var answerContainer = rootContainer.querySelector(".h5p-alternative-container[answer-id='" + i.toString() + "'")
          var svgout = new DOMParser().parseFromString(sanitizeXMLString(params.answers[i].answer_notation.notationWidget), "text/html").body.firstChild
          svgout.querySelectorAll("#manipulatorCanvas, #scoreRects, #labelCanvas, #phantomCanvas").forEach(c => c.remove())
          svgout.querySelectorAll(".marked, .lastAdded").forEach(m => {
            m.classList.remove("marked")
            m.classList.remove("lastAdded")
          })
          svgout.querySelectorAll("svg").forEach(svg => svg.style.transform = "scale(2.5)")
          $vseAnswer.append(svgout)
          answerContainer.appendChild($vseAnswer)

        }
      }
    }

    return this.vseInstances
  }

  /**
     * Adjust sizes according to definition-scale height of contents when all necessary containers are loaded.
     */
  MultiChoiceScore4LMS.prototype.adjustFrameResponsive = function (vseContainer) {

    var defScale = vseContainer.querySelector("#rootSVG .definition-scale")
    var dsHeight
    if (defScale !== null) {
      dsHeight = defScale.getBoundingClientRect().height * 2.5
      dsHeight = dsHeight.toString() + "px"
    }
    vseContainer.style.height = dsHeight || "20rem"

    var h5pContainer = vseContainer.parentElement //document.querySelector(".h5p-vse-container")
    var showChildren = h5pContainer.querySelectorAll(".vse-container")
    var h5pContainerHeight = 0
    showChildren.forEach(sc => {
      h5pContainerHeight += sc.getBoundingClientRect().height
      sc.style.position = "relative" // very important, so that the containers are displayed in the same column
    })
    h5pContainer.style.height = h5pContainerHeight.toString() + "px"
    window.frameElement.style.height = (parseFloat(window.frameElement.style.height) + h5pContainerHeight / 1).toString() + "px"
  }

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

    var parser = new DOMParser()
    var xmlDoc = parser.parseFromString(mei, "text/xml")
    return xmlDoc.querySelectorAll("layer").length === 1 && xmlDoc.querySelector("layer mRest") !== null
  }

  MultiChoiceScore4LMS.prototype.generateUID = function () {
    var firstPart = ((Math.random() * 46656) | 0).toString(36)
    var secondPart = ((Math.random() * 46656) | 0).toString(36)
    firstPart = ("000" + firstPart).slice(-3);
    secondPart = ("000" + secondPart).slice(-3);
    return firstPart + secondPart;
  }

  return MultiChoiceScore4LMS
})();

export default MCS4L