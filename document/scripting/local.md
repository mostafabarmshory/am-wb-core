# Local service

The local service is used to format date and time in to the local format. 

Here is an example:

	var localDate = $local.format('2019-01-01 23:30:30');

## Get date

To get data 

	var date = $local.getDate();
	
This is equivalent to:

	var data = new Date();

This is a javascript Date object.

## Format date

In many situations you have to format a date as local date. To do this:

	var formatedDate = $local.formatDate(date);

The syntax of the function is:

	var format = $local.formatDate(date, format);

By default it use system format. Note that the input date must be a valid UTC date.

In the following example, a UTC string date is converted to a local format:

	var formated = $local.formatDate('2019-01-01 00:00:00', 'jYYYY-jMM-jDD hh:mm:ss');

## Get currency

To get the default currency:

	var currency = $local.getCurrency();

## Get language


To get the default language:

	var language = $local.getLanguage();