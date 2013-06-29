/**
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

// ==UserScript==
// @name Scroll To Heading From Hash
// @author Craig Patik
// @namespace http://github.com/cpatik
// @version 1.0
// @description Enable jumping to any heading without adding IDs to the heading elements
// @include http://*
// ==/UserScript==

// Site owners can drop the code below into their pages,
// or end-users can install it by clicking `raw` in the top right of this gist

// Looks for a heading element that contains the text in the URL hash
(function _scrollToHash () {
    function scrollToHash () {
    if (!window.location.hash) { return; }
        var stripNonWordChars = /\W/g, // Ignore punctuation
        stripHTML = /<\/?[^>]+>/g, // Ignore HTML tags
        hash = new RegExp(window.location.hash.replace(stripNonWordChars, ""), "i"),
        headers = document.querySelectorAll('h1,h2,h3,h4,h5,h6'),
        i = 0;
        while (i < headers.length) { // for now, while is much faster than forEach :(
            // Quick and dirty comparison of the header's alphanumeric content to the hash's
            if (hash.test(headers[i].innerHTML.replace(stripHTML, "").replace(stripNonWordChars, ""))) {
                headers[i].scrollIntoView();
                break;
            }
            i++;
        }
    }
    window.addEventListener("load", scrollToHash, false);
    window.addEventListener("hashchange", scrollToHash, false);
}());

function cloudify() {
    tagCloudMaxWeight = 0;
    maxFontSize       = 35;
    minFontSize       = 8;

    differenceFont = maxFontSize - minFontSize;

    $('#wordcloud span[data-weight]').each(function() {
            elemWeight        = parseInt($(this).attr('data-weight'));
            tagCloudMaxWeight = elemWeight > tagCloudMaxWeight
            ? elemWeight
            : tagCloudMaxWeight;
            });

    $('#wordcloud span[data-weight]').each(function() {
            elemWeight = parseInt($(this).attr('data-weight'));
            percentage  = 100 / tagCloudMaxWeight * elemWeight;
            fontSize    = minFontSize + Math.round(differenceFont / 100 * percentage);
            $(this).css('font-size', fontSize + 'px');
            });
}

function parseSkills(elements) {
    for (id in elements) {
        element = elements[id];

        if (!skillContainer.hasOwnProperty(id)) skillContainer[id] = 0;
        skillContainer[id] += element.months;
    }
}

function parseSectionWithSkills(section) {
    parseSkills(section.methodologies);
    parseSkills(section.technologies);
    parseSkills(section.tools);
    parseSkills(section.techniques);
}

function loadPage(response) {
    $('div.hresume').html('');
    summary = getSection('Summary', response['information']['info'][languageCode]);
    $('div.hresume').append(summary);
    skills = getSection('Skills', $('<div>').attr({class: 'wordcloud', id: 'wordcloud'}));
    $('div.hresume').append(skills);
    education = getSection('Education', getEducation(response['education']));
    $('div.hresume').append(education);
    experience = getSection('Experience', getExperience(response['experience']));
    $('div.hresume').append(experience);
    languages = getSection('Languages', getLanguages(response['language']));
    $('div.hresume').append(languages);

    $('.show_hide').click(function(e) {
        e.preventDefault();
        $(this).next('div.hide').toggle();

        if ($(this).next('div.hide').css('display') === 'block') {
            $(this).html('&raquo; Hide');
        } else {
            $(this).html('&raquo; Show more...');
        }
    });

    skillContainer = {};
    for (id in response.experience) {
        experienceSec = response.experience[id];
        parseSectionWithSkills(experienceSec);
        for (id2 in experienceSec.projects) {
            projectSec = experienceSec.projects[id2];
            parseSectionWithSkills(projectSec);
        }
    }

    for (id in response.skills) {
        skillSec = response.skills[id];
        for (id2 in skillSec.list) {
            skill = skillSec.list[id2];

            name = skill.name.hasOwnProperty(languageCode) ? skill.name.en_GB : skill.name;
            proficiency = skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.substr(1);
            weight = skillContainer.hasOwnProperty(name) ? skillContainer[name] : 0;

            $('#wordcloud').append('<span title="' + proficiency  +' proficiency" data-weight="' + weight + '">' + name + '</span> ');
        }
    }

    cloudify();
}

function gettext(key) {
    return key;
}

function getSection(name, content) {
    sectionElement = $('<section>').attr('id', name.toLowerCase());

    divElement = $('<div>').addClass('page-header');

    h2Element = $('<h2>').text(name);
    divElement.append(h2Element);

    sectionElement.append(divElement);

    divElement = $('<div>').addClass('row');

    divElement.html(content);
    sectionElement.append(divElement);

    return sectionElement;
}

function getDefinitionList(data, name) {
    if (typeof data === 'undefined') {
        return;
    }

    dlElement = $('<dl>').attr({itemscope: 'itemscope', itemtype: 'http://schema.org/ItemList'});

    dtElement = $('<dt>').text(gettext(name));
    dlElement.append(dtElement);

    keys = $.map(data, function(element, index) { return index });

    //average = undefined;
    //if (Object.prototype.toString.call(data) === '[object Object]') {
    //    sum = 0;
    //    counter = 0;
    //    for (index in data) {
    //        sum += data[index]['months'];
    //        counter++;
    //    }
    //    average = parseInt(sum / counter);
    //}

    counter = 0;
    for (index in data) {
        value = data[index];
        if (typeof value === 'object') {
            //if (average !== undefined && value['months'] < average) {
            //    continue;
            //}

            value = index;
        }

        ddElement = $('<dd>').attr({itemprop: 'itemListElement', class: ''});

        last = $(data).last();
        if (typeof data[k] === 'object') {
            last = $(keys).last();
        }

        if (last[0] === value) {
            ddElement.addClass('last');
        }
        ddElement.text(gettext(value));
        dlElement.append(ddElement);

        counter++;
    }

    return counter > 0 ?  dlElement : undefined;
}

function getDates(data) {
    datesElement = $('<div>').addClass('dates');

    dateStart = dateFormat(data['start'], 'dd mmm yyyy');

    dateStartElement = $('<div>').addClass('dtstart').text(dateStart);
    datesElement.append(dateStartElement);

    if (typeof data['end'] !== 'undefined') {
        dateEndElement = $('<div>').addClass('dtend');

        dateEnd = dateFormat(data['end'], 'dd mmm yyyy');
        if (data['end'] === -1) {
            dateEndElement.text('Today');
        } else {
            dateEndElement.text(dateEnd);
        }

        datesElement.append(dateEndElement);
    }

    return datesElement;
}

function getEducation(data) {
    divElement = $('<div>').addClass('span12 vcalendar');

    counter = 0;
    rowElement = $('<div>').addClass('row-fluid');

    for (k in data) {
        id = MD5(data[k]['title'][languageCode] + data[k]['institute']['name']);

        eventElement = $('<div>').attr({class: 'span6 education vevent', id: id, itemscope: 'itemscope', itemtype: 'http://schema.org/EducationEvent'});

        h3Element = $('<h3>').text(data[k]['title'][languageCode]);
        eventElement.append(h3Element);

        contactElement = $('<div>').attr({class: 'contact', itemscope: 'itemscope', itemtype: 'http://schema.org/Organization'});

        anchorElement = $('<a>').attr({class: 'url', href: data[k]['institute']['url'], itemprop: 'url', rel: 'nofollow', target: '_blank', title: data[k]['institute']['name']});

        eventElement.append(getDates(data[k]['date']));

        spanElement = $('<span>').attr({class: 'fn', itemprop: 'name'}).text(data[k]['institute']['name']);
        anchorElement.append(spanElement);
        contactElement.append(anchorElement);

        contactElement.append(getAddress(data[k]['institute']['location']));
        eventElement.append(contactElement);

        if (typeof data[k]['activities'] !== 'undefined') {
            activitiesContainerElement = $('<div>').addClass('hide');

            activitiesContainerElement.append(getDefinitionList(data[k]['activities'][languageCode], 'Activities'));
            eventElement.append(activitiesContainerElement);

            if (activitiesContainerElement.find('*').length > 0) {
                showMoreElement = $('<a>').attr({class: 'show_hide', href: '#'}).html('&raquo; Show more ...');
                eventElement.find('div.hide').before(showMoreElement);
            }
        }


        counter++;
        if (counter % 2 === 0) {
            divElement.append(rowElement);
            rowElement = $('<div>').addClass('row-fluid');
        }
        rowElement.append(eventElement);
    }
    divElement.append(rowElement);

    return divElement;
}

function getExperience(data) {
    divElement = $('<div>').addClass('span12 vcalendar');

    counter = 0;
    rowElement = $('<div>').addClass('row-fluid');

    for (k in data) {
        id = MD5(data[k]['role'][languageCode] + data[k]['company']['name']);

        eventElement = $('<div>').attr({class: 'span6 experience vevent', id: id, itemscope: 'itemscope', itemtype: 'http://schema.org/BusinessEvent'});

        h3Element = $('<h3>').text(data[k]['role'][languageCode]);
        eventElement.append(h3Element);

        eventElement.append(getDates(data[k]['date']));

        contactElement = $('<div>').attr({class: 'contact', itemscope: 'itemscope', itemtype: 'http://schema.org/Organization'});

        anchorElement = $('<a>').attr({class: 'url', href: data[k]['company']['url'], itemprop: 'url', rel: 'nofollow', target: '_blank', title: data[k]['company']['name']});

        spanElement = $('<span>').attr({class: 'fn', itemprop: 'name'}).text(data[k]['company']['name']);
        anchorElement.append(spanElement);
        contactElement.append(anchorElement);

        contactElement.append(getAddress(data[k]['company']['location']));
        eventElement.append(contactElement);

        containerElement = $('<div>').addClass('hide');

        if (typeof data[k]['description'] !== 'undefined') {
            descriptionElement = $('<div>').attr('itemprop', 'description');

            paragraphElement = $('<p>').text(data[k]['description'][languageCode]);
            descriptionElement.append(paragraphElement);

            containerElement.append(descriptionElement);
        }

        containerElement.append(getDefinitionList(data[k]['activities'], 'Activities'));

        if (typeof data[k]['projects'] !== 'undefined') {
            accordionElement = $('<div>').attr({class: 'accordion', id: 'accordion' + id});

            h4Element = $('<h4>').text('Projects');
            accordionElement.append(h4Element);

            for (k2 in data[k]['projects']) {
                accordion_id = data[k]['projects'][k2]['name'];
                accordionGroupElement = $('<div>').addClass('accordion-group');

                accordionHeadingElement = $('<div>').addClass('accordion-heading');

                accordionToggle = $('<a>').attr({class: 'accordion-toggle', 'data-parent': '#accordion' + accordion_id, 'data-toggle': 'collapse', href: '#collapse' + accordion_id});

                h5Element = $('<h5>').attr('itemprop', 'name').text(data[k]['projects'][k2]['name']);

                accordionToggle.append(h5Element);
                accordionHeadingElement.append(accordionToggle);
                accordionGroupElement.append(accordionHeadingElement);

                accordionBodyElement = $('<div>').attr({class: 'accordion-body collapse', id: 'collapse' + accordion_id});

                accordionBodyElement.append(getDates(data[k]['projects'][k2]['date']));

                roleElement = $('<span>').addClass('role').text(data[k]['projects'][k2]['role'][languageCode]);
                accordionBodyElement.append(roleElement);

                if (typeof data[k]['projects'][k2]['description'] !== 'undefined') {
                    descriptionElement = $('<div>').attr('itemprop', 'description');

                    paragraphElement = $('<p>').text(data[k]['projects'][k2]['description'][languageCode]);
                    descriptionElement.append(paragraphElement);

                    accordionBodyElement.append(descriptionElement);
                }

                if (typeof data[k]['projects'][k2]['link'] !== 'undefined') {
                    anchorElement = $('<a>').attr({href: data[k]['projects'][k2]['link'], itemprop: 'url', rel: 'nofollow', target: '_blank', title: 'The URL of the ' + data[k]['projects'][k2]['title']}).text(data[k]['projects'][k2]['link']);

                    accordionBodyElement.append(anchorElement);
                }

                if (typeof data[k]['projects'][k2]['methodologies'] !== 'undefined') {
                    accordionBodyElement.append(getDefinitionList(data[k]['projects'][k2]['methodologies'], 'Methodologies'));
                }
                if (typeof data[k]['projects'][k2]['technologies'] !== 'undefined') {
                    accordionBodyElement.append(getDefinitionList(data[k]['projects'][k2]['technologies'], 'Technologies'));
                }
                if (typeof data[k]['projects'][k2]['tools'] !== 'undefined') {
                    accordionBodyElement.append(getDefinitionList(data[k]['projects'][k2]['tools'], 'Tools'));
                }
                if (typeof data[k]['projects'][k2]['techniques'] !== 'undefined') {
                    accordionBodyElement.append(getDefinitionList(data[k]['projects'][k2]['techniques'], 'Techniques'));
                }
                accordionGroupElement.append(accordionBodyElement);

                accordionElement.append(accordionGroupElement);
            }

            containerElement.append(accordionElement);
        }

        containerElement.append(getDefinitionList(data[k]['methodologies'], 'Methodologies'));
        containerElement.append(getDefinitionList(data[k]['technologies'], 'Technologies'));
        containerElement.append(getDefinitionList(data[k]['tools'], 'Tools'));
        containerElement.append(getDefinitionList(data[k]['techniques'], 'Techniques'));

        eventElement.append(containerElement);

        if (containerElement.find('*').length > 0) {
            showMoreElement = $('<a>').attr({class: 'show_hide', href: '#'}).html('&raquo; Show more ...');
            eventElement.find('div.hide').before(showMoreElement);
        }

        counter++;
        if (counter % 2 === 0) {
            divElement.append(rowElement);
            rowElement = $('<div>').addClass('row-fluid');
        }
        rowElement.append(eventElement);
    }
    divElement.append(rowElement);

    return divElement;
}

function getAddress(address) {
    if (typeof address === 'undefined') {
        return;
    }

    addressElement = $('<address>').attr({class: 'adr', itemprop: 'address', itemscope: 'itemscope', itemtype: 'http://schema.org/PostalAddress'});

    if (typeof address['postalcode'] !== 'undefined') {
        spanElement = $('<span>').attr({class: 'postal-code', itemprop: 'postalCode'}).text(address['postalcode']);
        addressElement.append(spanElement);
    }

    if (typeof address['city'] !== 'undefined') {
        spanElement = $('<span>').attr({class: 'locality', itemprop: 'addressLocality'}).text(address['city'][languageCode]);
        addressElement.append(spanElement);
    }

    if (typeof address['country'] !== 'undefined') {
        spanElement = $('<span>').attr({class: 'country-name', itemprop: 'addressCountry'}).text(address['country'][languageCode]);
        addressElement.append(spanElement);
    }

    return addressElement;
}

function getLanguages(data) {

    mapping = {
        A1: 'Beginner',
        A2: 'Elementary',
        B1: 'Intermediate',
        B2: 'Upper Intermediate',
        C1: 'Advanced',
        C2: 'Mother-tongue'
    };

    divElement = $('<div>').addClass('span12');

    rowElement = $('<div>').addClass('row-fluid');

    for (k in data) {
        containerElement = $('<div>').attr({class: 'span6', itemscope: 'itemscope', itemtype: 'http://schema.org/Language'});

        h3Element = $('<h3>').attr({class: 'summary', itemprop: 'name'}).text(data[k]['language'][languageCode]);
        containerElement.append(h3Element);

        descriptionElement = $('<div>').attr('itemprop', 'description');

        pElement = $('<p>').text(mapping[data[k]['knowledge']['overall']]);
        descriptionElement.append(pElement);
        containerElement.append(descriptionElement);
        rowElement.append(containerElement);
    }

    divElement.append(rowElement);

    return divElement;
}
