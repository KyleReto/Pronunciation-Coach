
// Like productionRules.nools, this file is a hot mess. You have been warned.

let idIncrement = 0;

const stepPrompts = new Map();
stepPrompts.set(1, "What word would you like to learn?");
stepPrompts.set(2, "Which letters are vowels?");
stepPrompts.set(3, "Where do we split up the syllables in the word?");
stepPrompts.set(4, "What does each vowel sound like?");

$(function(){
    setTimeout(() => {  fixInputIds(); }, 500);
    $(document).keyup(function(event) {
        if (event.keyCode === 13) {
            $(".CTATSubmitButton").children().click();
        }
    });
})

// Clone a div to the attempt log, removing it from CTAT's view.
function logToAttempts(containerString){
    let ele = $(containerString).clone();
    ele = ele.prop('outerHTML').replace(/CTAT/ig, "TATC")
    ele = $(ele);

    // handle special cases not copied by clone
    ele.find('select').each(function(){
        let currentId = $(this).attr('id').replace(/TATC/ig, 'ctat');
        $(this).val($('#' + currentId).children('option:selected').val());
    })
    ele.find('input').each(function(){
        let currentId = $(this).attr('id').replace(/TATC/ig, 'ctat');
        $(this).val($('#' + currentId).val());
        if (!$('#' + currentId).is(":checked")){
            $(this).removeClass('TATC--incorrect');
            $(this).next().removeClass('TATC--incorrect');
            $(this).addClass('TATC--blank');
            $(this).next().addClass('TATC--blank');
        }
    })

    ele.find('*').each(function(){
        // prevent collisions
        $(this).attr('id', 'tempId' + idIncrement);
        $(this).attr('name', 'tempId' + idIncrement);
        $(this).attr('for', 'tempId' + idIncrement);
        $(this).attr('disabled', '');
        idIncrement++;
    });
    ele.attr('id', 'container' + idIncrement);
    ele.addClass('containerCopy');
    idIncrement++;
    ele.appendTo("#ia6l8");
}

// Call all relevant functions to start the next step
function startStep(stepNum){
    stepNum = parseInt(stepNum);
    highlightStep(stepNum);
    hideIrrelevantSteps(stepNum);
    setPrompt(stepPrompts.get(stepNum));
}

// Highlight (bold) a step on the left, so the student can tell where they are.
function highlightStep(stepNum){
    $('.stepLabel').css('font-weight', 'normal');
    $('.stepLabel:nth-child(' + (parseInt(stepNum) + 1) + ')').css('font-weight', 'bold')
}

// Hide all steps except this one in the workspace, so the student works on the right thing.
function hideIrrelevantSteps(stepNum){
    let children = $('#workspaceContainer > div:not(#workspacePrompt, #submitButton)');
    children.each(function(index){
        if (index+1 != stepNum){
            $(this).hide();
        } else {
            $(this).show();
        }
    })
}

// Set the prompt in the interface
function setPrompt(promptStr){
    $('#workspacePrompt').text(promptStr);
}

// Update step 2 so that it matches a given word
function generateVowelId(wordStr){
    let container = $('#vowelIdContainer');
    let template = container.find('>:first-child').clone();
    let names = '';

    // clear container
    container.children().remove();

    // Replace the text so it matches
    for (let i = 0; i < wordStr.length; i++){
        let item = template.clone();
        item.find(">:first-child").text(wordStr.charAt(i));
        item.appendTo(container);
        names += 'vowelInput' + i + ';';
    }
    
    // prevent collisions
    container.find('*').each(function(){
        $(this).attr('id', 'tempId' + idIncrement);
        $(this).attr('name', 'tempId' + idIncrement);
        $(this).attr('for', 'tempId' + idIncrement);
        idIncrement++;
    });

    fixInputIds();
    changeSubmitName(names);
}

// Update step 3 so that it matches a given word
function generateBreaking(wordStr){
    let container = $('#breakingContainer');
    let letterTemplate = container.find('>:first-child').clone();
    let breakTemplate = container.find('>:nth-child(2)');
    let names = '';

    // clear container
    container.children().remove();

    // Replace the text so it matches
    for (let i = 0; i < wordStr.length; i++){
        let item = letterTemplate.clone();
        item.text(wordStr.charAt(i));
        item.appendTo(container);
        if (i < wordStr.length - 1){
            breakTemplate.clone().appendTo(container);
        }
        names += 'breakInput' + i + ';';
    }
    
    // prevent collisions
    container.find('*').each(function(){
        $(this).attr('id', 'tempId' + idIncrement);
        $(this).attr('name', 'tempId' + idIncrement);
        $(this).attr('for', 'tempId' + idIncrement);
        idIncrement++;
    });

    fixInputIds();
    changeSubmitName(names);

}

// Update step 4 so it matches the given set of syllables
function generateOpenClosed(syllArr){
    // handle example tracing
    if (typeof syllArr == 'string'){
        let arr = [];
        let str = '';
        for (let i = 1; i < syllArr.length-1; i++){
            if (syllArr.charAt(i) == ','){
                arr.push(str);
                str = '';
            } else {
                str += syllArr.charAt(i);
            }
        }
        arr.push(str);
        syllArr = arr;
    }
    let container = $('#openClosedContainer');
    let template = container.find('>:first-child').clone();
    let names = '';

    // clear container
    container.children().remove();
    // Replace the text so it matches
    for (let i = 0; i < syllArr.length; i++){
        let item = template.clone();
        item.find('>:nth-child(2)').text(syllArr[i]);
        item.appendTo(container);
        names += 'openClosedSelect' + i + ';';
    }
    
    // prevent collisions
    container.find('*').each(function(){
        $(this).attr('id', 'tempId' + idIncrement);
        $(this).attr('name', 'tempId' + idIncrement);
        $(this).attr('for', 'tempId' + idIncrement);
        idIncrement++;
    });

    container.find('option').remove();
    fixInputIds();
    changeSubmitName(names);
}

// Fix the interactable elements so that they have CTAT-recognizable IDs
function fixInputIds(){
    let workspace = $('#workspaceContainer');
    // update the word textbox
    workspace.find('#wordEntryBox > input').attr('id', 'wordEntryInput');

    // update the vowel ID checkboxes
    let vowelCount = 0;
    workspace.find('#vowelIdContainer > div > .VowelCheck').each(function(){
        $(this).attr('name', 'vowelInput' + vowelCount);
        $(this).attr('id', 'vowelInput' + vowelCount);
        $(this).siblings().attr('for', 'vowelInput' + vowelCount);
        vowelCount++;
    });

    // update the breaking checkboxes
    let breakCount = 0;
    workspace.find('#breakingContainer > .BreakCheck').each(function(){
        $(this).attr('name', 'breakInput' + breakCount);
        $(this).attr('id', 'breakInput' + breakCount);
        $(this).siblings().attr('for', 'breakInput' + breakCount);
        breakCount++;
    });

    // update the open/closed selections
    let selectionCount = 0;
    workspace.find('#openClosedContainer > .openClosedItem > div:nth-child(1)').each(function(){
        $(this).attr('name', 'openClosedSelect' + selectionCount);
        $(this).attr('id', 'openClosedSelect' + selectionCount);
        $(this).siblings().attr('for', 'openClosedSelect' + selectionCount);
        selectionCount++;
    });

    setTimeout(() => {  $('label').empty(); }, 10);
}

// Update the name of the submit button
function changeSubmitName(name){
    setTimeout(() => {  
        $('#submitButton').attr('data-ctat-target', 'submitButton;' + name);
    }, 500);
}