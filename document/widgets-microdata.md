# Widget Microdata

## Introduction

This  specification defines new Widget attributes to embed simple machine-readable data in Weburger documents. It is similar to, but generally less expressive than HTML Microdata, and does not support the same level of standards. It is simple to learn and process, but not as general as RDF or HTML Microdata is.

### Status of This Document

This section describes the status of this document at the time of its publication. Other documents may supersede this document. A list of current  publications and the latest revision of this technical report can be found in the project home at https://gitlab.com/am-wb/am-wb-core.

If you wish to make comments regarding this document please submit them as gitlab issues. All feedback is welcome, but please note the contribution guidelines require agreement to the terms of the WB Patent Policy for substantive contributions.

This document was published by the Web WB Group as a Working Draft. This document is intended to become a WB Recommendation.

Publication as a Working Draft does not imply endorsement by the W3C Membership. This is a draft document and may be updated, replaced or obsoleted by other documents at any time. It is inappropriate to cite this document as other than work in progress.

This document was produced by a group operating under the WB Policy. WB maintains a public list of any patent disclosures made in connection with the deliverables of the group; that page also includes instructions for disclosing a patent. An individual who has actual knowledge of a patent which the individual believes contains Essential Claim(s) must disclose the information in accordance with section 6 of the WB Patent Policy.

### Dependencies

This specification is an extension to HTML. All normative content in the HTML specification not specifically overridden by this specification is intended to be normative for this specification. This specification depends on the HTML specification and its extensions for definitions of individual HTML elements and attributes.

### Terminology

For the purposes of this specification, the terms "URL" and "URI" are equivalent. The URL specification, and RFC 3986 which uses the term URI, define a URL, valid URL, and absolute URL.

This specification relies on the HTML specification to define the following terms: [HTML52]

- space characters, split a string on spaces, and an unordered set of unique space-separated tokens.
- HTML Element, global attribute, boolean attribute.
- An element's ID and language.
- flow content and phrasing content.

### Conformance

The key words "must", "must not", "should", "should not", and "may" in the of this document are to be interpreted as described in RFC2119. [RFC2119]

Requirements phrased in the imperative as part of algorithms (such as "strip any leading space characters" or "return false and abort these steps") are to be interpreted with the meaning of the key word ("must", "should", "may", etc) used in introducing the algorithm.
	
	EXAMPLE 1: conformance language
	For example, were the spec to say:
	
	To eat an orange, the user must:
	1. Peel the orange.
	2. Separate each slice of the orange.
	3. Eat the orange slices.
	...it would be equivalent to the following:
	
	To eat an orange:
	1. The user must peel the orange.
	2. The user must separate each slice of the orange.
	3. The user must eat the orange slices.
	Here the key word is "must".
	
	The former (imperative) style is generally preferred in this specification for stylistic reasons.

Conformance requirements phrased as algorithms or specific steps may be implemented in any manner, so long as the end result is equivalent. (In particular, the algorithms defined in this specification are intended to be easy to follow, and not intended to be performant.)

## Introduction

Sometimes, it is desirable to annotate content with specific machine-readable labels. For example, search engines can better identify page content using schema.org annotations, and content management systems can find and use information from documents, if it is marked up in a known way.

Microdata provides a simple mechanism to label widgets in a document, so it can be processed as a set of items described by name-value pairs.

Each name-value pair identifies a property of the item, and a value of that property.

Figure 1 A common way to represent items, properties and values graphically
[img](widgets-microdata/property-model.svg)
    
The value of a property may be another item.

### The basic syntax

Items and properties are generally represented by regular widget.

The itemscope attribute creates an item from a widget. In the other word, itemscope group a listof key-value properties as an item.

The itemprop attribute on a descendent widgets of an item identifies a property of that item. Typically, the text content of that element is the value of that property.

Here there are two items, each of which has the property "name":

	{
		type: "group",
		itemscope: true,
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "p",
			html: "My name is:"
		}, {
			type: "p",
			itemprop: "name",
			html: "Mostafa"
		}]
	}



Widgets other than Microdata attributes has no effect on Microdata.


Note that this means any information recorded in widget for purposes such as internationalization or accessibility will be lost in the conversion to data. 

Properties generally have values that are strings. Here the item has three properties:


	{
		type: "group",
		itemscope: true,
		contents:[{
			type: "group",
			style: {
				layout:{
					direction: "row"
				}
			},
			contents:[{
				type: "p",
				html: "My name is:"
			}, {
				type: "p",
				itemprop: "name",
				html: "Mostafa"
			}]
		},{
			type: "group",
			style: {
				layout:{
					direction: "row"
				}
			},
			contents:[{
				type: "p",
				html: "My band is called:"
			}, {
				type: "p",
				itemprop: "band",
				html: "Four Parts Water"
			}]
		}]
	}

If the text that would normally be the value of a property, such as the element content, is unsuitable for recording the property value, it can be expressed using the content attribute of the element.

Here, the visible content may be added by a script. A Microdata processor can extract the content from the content attribute without running scripts. The value of the product-id property for this item is 9678AOU879


	{
		type: "group",
		itemscope: true,
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "p",
			itemprop: "name",
			content: "Mostafa",
			html: "My name is: Mostafa"
		}]
	}


When a string value is in some machine-readable format unsuitable to present as the content of an element, it can be expressed using the value attribute of the data element, as long as there is no content attribute.

Here, there is an item with a property whose value is a product identifier. The identifier is not human-friendly, so instead it is encoded for Microdata using the value attribute of the data element, and the product's name is used as the text content of the element that is rendered on the page.


	{
		type: "group",
		itemscope: true,
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "p",
			itemprop: "product-id",
			value: "9678AOU879",
			html: "The Instigator 2000"
		}]
	}


This will not work if there is a content attribute as well. In the following example, the value of the product-id property is taken from the content attribute, so it will be This one rocks!:


	{
		type: "group",
		itemscope: true,
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "p",
			itemprop: "product-id",
			value: "9678AOU879",
			content: "This one rocks!",
			html: "The Instigator 2000"
		}]
	}


When an itemprop is used on an element that can have a src or href attribute, such as links and media elements, that does not have a content attribute, the value of the name-value pair is an absolute URL based on the src or href attribute (or the empty string if they are missing or there is an error).

In this example, the item has one property, logo, whose value is a URL based on the location of the page, and ending with our-logo.png:


	{
		type: "group",
		itemscope: true,
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "img",
			itemprop: "logo",
			alt: "Our Company",
			src: "our-logo.png"
		}]
	}

Note that accessibility information, such as the alt attribute in the previous example, is ignored. To provide that as a value, repeat it in a content attribute. In the following example, the value of the name property is The Company:

	{
		type: "group",
		itemscope: true,
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "img",
			itemprop: "logo",
			alt: "Our Company",
			content: "The Company",
			src: "our-logo.png"
		}]
	}
	
For numeric data, the meter element and its value attribute can be used instead, as long as there is no content attribute.

Here a rating of 3.5 is given using a meter element.

	{
		type: "group",
		itemscope: true,
		itemtype: "https://schema.org/Product",
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "h3",
			itemprop: "name",
			html: "Panasonic White 60L Refrigerator"
		},{
			type: "img",
			alt: "Our Company",
			src: "panasonic-fridge-60l-white.jpg"
		},{
			type: "group",
			itemprop: "aggregateRating",
			itemscope: true,
			itemtype: "https://schema.org/AggregateRating",
			contents:[{
				type: "meter",
				itemprop: "ratingValue",
				min: 0,
				value: 3.5,
				max: 5,
				html: "Rated 3.5/5"
			},{
				type: "p",
				itemprop: "reviewCount",
				content: "11",
				html: "(based on 11 customer reviews)"
			}]
		}]
	}


Similarly, for date- and time-related data, the time element and its datetime attribute can be used to specify a specifically formatted date or time, as long as there is no content attribute.

In this example, the item has one property, "birthday", whose value is a date:

	{
		type: "group",
		itemscope: true,
		style: {
			layout:{
				direction: "row"
			}
		},
		contents:[{
			type: "time",
			itemprop: "birthday",
			datetime: "2009-05-10",
			html: "May 10th 2009"
		}]
	}

Properties can also themselves be groups of name-value pairs, by putting the itemscope attribute on the element that declares the property.

Items that are not part of others are called top-level Microdata items.

In this example, the outer item represents a person, and the inner one represents a band:


	{
		type: "group",
		itemscope: true,
		contents:[{
			type: "p",
			itemprop: "name",
			content: "Amanda",
			html: "Name: Amanda"
		},{
			type: "group",
			itemprop: "band",
			itemscope: true,
			content: [{
				type: "p",
				itemprop: "name"
				content: "Jazz Band",
				html: "Band: Jazz Band"
			},{
				type: "p",
				itemprop: "size"
				content: "12",
				html: "Size: 12"
			}]
		}]
	}
	
The outer item here has two properties, "name" and "band". The "name" is "Amanda", and the "band" is an item in its own right, with two properties, "name" and "size". The "name" of the band is "Jazz Band", and the "size" is "12".

The outer item in this example is a top-level Microdata item.

Properties that are not descendants of the element with the itemscope attribute can be associated with the item using the itemref attribute. This attribute takes a list of IDs of elements to crawl in addition to crawling the children of the element with the itemscope attribute.

An item can have multiple properties with the same name and different values.

This example describes an ice cream, with two flavors:



	{
		type: "group",
		itemscope: true,
		contents:[{
			type: "p",
			html: "Flavors in my favorite ice cream:"
		},{
			type: "group",
			content: [{
				type: "p",
				itemprop: "flavor"
				html: "Lemon sorbet"
			},{
				type: "p",
				itemprop: "flavor"
				html: "Apricot sorbet"
			}]
		}]
	}

This thus results in an item with two properties, both "flavor", having the values "Lemon sorbet" and "Apricot sorbet".

An widget introducing a property can also introduce multiple properties at once, to avoid duplication when some of the properties have the same value.

Here we see an item with two properties, "favorite-color" and "favorite-fruit", both set to the value "orange":

	{
		type: "group",
		itemscope: true,
		contents:[{
			type: "p",
			itemprop: "favorite-color favorite-fruit", 
			html: "orange"
		}]
	}
	

It's important to note that there is no relationship between the Microdata and the content of the document where the Microdata is marked up.

### Typed items

The examples in the previous section show how information could be marked up on a page that doesn't expect its Microdata to be re-used. Microdata is most useful, though, when it is used in contexts where other authors and readers are able to cooperate to make new uses.

For this purpose, it is necessary to give each item a type, such as "http://example.com/person", or "http://example.org/cat", or "http://band.example.net/". Types are identified as URLs.

The type for an item is given as the value of an itemtype attribute on the same element as the itemscope attribute. The value is a URL, which determines the vocabulary identifier for properties

Assuming a page at http://example.net/some/dataexample contains the following code:


	{
		type: "group",
		itemscope: true,
		itemtype: "http://example.org/animals#cat",
		contents:[{
			type: "h1",
			itemprop: "name", 
			html: "Hedral"
		},{
			type: "p",
			itemprop: "desc", 
			html: "Hedral is a male american domestic shorthair, with a fluffy black fur with white paws and belly."
		},{
			type: "img",
			itemprop: "img",
			src: "hedral.jpeg",
			title: "Hedral, age 18 months"
		}]
	}
	

The item's type is "http://example.org/animals#cat"

In this example the "http://example.org/animals#cat" item has three properties:

The type gives the context for the properties, thus selecting a vocabulary: a property named "class" given for an item with the type "http://census.example/person" might refer to the economic class of an individual, while a property named "class" given for an item with the type "http://example.com/school/teacher" might refer to the classroom a teacher has been assigned. A vocabulary may define several types. For example, the types "http://example.org/people/teacher" and "http://example.org/people/engineer" could be defined in the same vocabulary. Some properties might not be especially useful in both cases: the "classroom" property might not be meaningful with the "http://example.org/people/engineer" type. Multiple types from the same vocabulary can be given for a single item by listing the URLs, separated by spaces, in the attribute's value. An item cannot be given two types if they do not use the same vocabulary, however.

### Global identifiers for items

Sometimes, an item gives information about a topic that has a global identifier. For example, books can be identified by their ISBN number, or concepts can be identified by a URL. The itemid attribute associates an item with a global identifier in the form of a URL.

Here, an item is talking about a particular book:


	{
		type: "group",
		itemscope: true,
		itemtype: "http://vocab.example.net/book",
		itemid: "urn:isbn:0-330-34032-8",
		content: [{
			type: "p",
			itemprop: "title",
			content: "The Reality Dysfunction",
			html: "Title: The Reality Dysfunction",
		},{
			type: "p",
			itemprop: "author",
			content: "Peter F. Hamilton",
			html: "Author: Peter F. Hamilton",
		},{
			type: "time",
			itemprop: "pubdate",
			datetime: "1996-01-26",
			html: "Publication date: Peter F. Hamilton",
		}]
	}


### Selecting names when defining vocabularies

Using Microdata means using a vocabulary. For some purposes an ad-hoc vocabulary is adequate, but authors are encouraged to re-use existing vocabularies to make content re-use easier.

When designing new vocabularies, identifiers can be created either using URLs, or, for properties, as plain words (with no dots or colons). For URLs, conflicts with other vocabularies can be avoided by only using identifiers that correspond to pages that the author has control over.

For instance, if Jon and Adam both write content at example.com, at http://example.com/~jon/... and http://example.com/~adam/... respectively, then they could select identifiers of the form "http://example.com/~jon/name" and "http://example.com/~adam/name" respectively.

Properties whose names are just plain words can only be used within the context of the types for which they are intended; properties named using URLs can be reused in items of any type. If an item has no type, and is not part of another item, then if its properties have names that are just plain words, they are not intended to be globally unique, and are instead only intended for limited use. Generally speaking, authors are encouraged to use either properties with globally unique names (URLs) or ensure that their items are typed.

Here, an item in the page http://example.net/some/dataexample is an "http://myvocab.example.org/animals/cat", and most of the properties have names defined in the context of that type. There are also a few additional properties whose names come from other vocabularies.

	{
		type: "group",
		itemscope: true,
		itemtype: "http://myvocab.example.org/animals/cat",
		content:[{
			type: 'h1',
			itempprop="name http://example.com/fn",
			html: "Hedral"
		},{
			type: 'p',
			itempprop="desc",
			html: "Hedral is a male american domestic shorthair, with a fluffy black fur with white< paws and belly."
		},{
			type: "img",
			itemprop: "img",
			src: "hedral.jpeg",
			alt: "",
			title: "Hedral, age 18 months"
		}]
	
	}


## Encoding Microdata

### The Microdata model

The Microdata model consists of groups of name-value pairs known as items.

Each group is known as an item. Each item can have zero or more item types, global identifier(s), and associated name-value pairs. Each name in the name-value pair is known as a property, and each property has one or more values. Each value is either a string or itself a group of name-value pairs (an item). Properties and their values are unordered, and authors must not rely on a particular ordering being preserved.

### Items: itemscope, itemtype, and itemid

Every widget may have an itemscope attribute specified. The itemscope attribute is a boolean attribute.

A widget with the itemscope attribute specified creates a new item, a group of name-value pairs that describe properties, and their values, of the thing represented by that widget.

Widget with an itemscope attribute may have an itemtype attribute specified, to give the item types of the item.

The itemtype attribute, if specified, must have a value that is an unordered set of unique space-separated tokens that are case-sensitive, each of which is a valid absolute URL, and all of which are in the same vocabulary. The attribute's value must have at least one token.

The item types of an item are the tokens obtained by splitting the element's itemtype attribute's value on spaces. If the itemtype attribute is missing or parsing it in this way finds no tokens, the item is said to have no item types.

The item types determine the vocabulary identifier. This is a URL that is prepended to property names, which identifies them as part of their vocabulary. The value of the vocabulary identifier for an item is determined as follows:

	Let potential values be an empty array of URLs.
	Let tokens be the value of the itemtype attribute, split on spaces.
	For each value of tokens:
	If there is a NUMBER SIGN U+0023 ("#") in the value
		Append the substring of the value from the beginning to the first NUMBER SIGN U+0023 ("#") to potential values
	Otherwise, if there is a SOLIDUS U+002F ("/") in the value
		Append the substring of the value from the beginning to the last SOLIDUS U+002F ("/") to potential values
	Otherwise
		Append a SOLIDUS U+002F ("/") to the value, and append the resulting string to potential values
	If there is only one unique value in potential values return that value. Otherwise return the first item in potential values.

User agents must not automatically dereference unknown URLs given as item types and property names. These URLs are a priori opaque identifiers.

NOTE: A specification could define that its item types can be derefenced to provide the user with help information. Vocabulary authors are encouraged to provide useful information at the given URL, either in prose or a formal language such as RDF.

The itemtype attribute must not be specified on widget that do not have an itemscope attribute specified.

An item is said to be a typed item when either it has an item type, or it is the value of a property of a typed item. The relevant types for a typed item is the item's item types, if it has any, or else is the relevant types of the item for which it is a property's value.

Elements with an itemscope attribute may also have an itemid attribute specified, to give a global identifier for the item, so that it can be related to other items elsewhere on the Web, or with concepts beyond the Web such as ISBN numbers for published books.

The itemid attribute, if specified, must have a value that is a valid URL potentially surrounded by space characters.

The global identifier of an item is the value of its element's itemid attribute, if it has one, resolved relative to the element on which the attribute is specified. If the itemid attribute is missing or if resolving it fails, it is said to have no global identifier.

The itemid attribute must not be specified on widget that do not have an itemscope attribute.

This example shows Microdata used to describe model railway products. manufacturer. The vocabulary identifier is https://md.example.com/. The example uses five property names:

- product-code: A number that identifies the product in the manufacturer's catalog.
- name: A brief description of the product.
- scale: One of "HO", "1", or "Z" (potentially with leading or trailing whitespace), indicating the scale of the product.
- digital:  If present, one of "Digital", "Delta", or "Systems" (potentially with leading or trailing whitespace) indicating that the product has a digital decoder of the given type.
- track-type:  For track-specific products, one of "K", "M", "C" (potentially with leading or trailing whitespace) indicating the type of track for which the product is intended.

It identifies four item types:

- https://md.example.com/loco: Rolling stock with an engine
- https://md.example.com/passengers: Passenger rolling stock
- https://md.example.com/track: Track pieces
- https://md.example.com/lighting: Equipment with lighting

Each item that uses this vocabulary can be given one or more of these types, depending on what the product is.

Thus, a locomotive might be designed as:

	{
		type: "group",
		itemscope: true,
		itemtype: "https://md.example.com/loco https://md.example.com/lighting",
		itemid: "https://md.example.com/product-catalog/33041"
		content:[{
			type: "p",
			itemprop: "name",
			content: "Tank Locomotive (DB 80)"
			html: "Name: Tank Locomotive (DB 80)"
		},{
			type: "p",
			itemprop: "product-code",
			content: "33041",
			html: "Product code: 33041"
		},{
			type: "p",
			itemprop: "scale",
			content: "HO",
			html: "Scale: HO"
		},{
			type: "p",
			itemprop: "digital",
			content: "Delta",
			html: "Digital: Delta"
		}]
	}


A turnout lantern retrofit kit might be marked up as:

	{
		type: "group",
		itemscope: true,
		itemtype: "https://md.example.com/track https://md.example.com/lighting",
		itemid: "https://md.example.com/product-catalog/74470"
		content:[{
			type: "p",
			itemprop: "name",
			content: "Turnout Lantern Kit"
			html: "Name: Turnout Lantern Kit"
		},{
			type: "p",
			itemprop: "product-code",
			content: "74470",
			html: "Product code: 74470"
		},{
			type: "p",
			itemprop: "track-type",
			content: "C",
			html: "Purpose: For retrofitting 2 C Track turnouts."
		},{
			type: "meta",
			itemprop: "scale",
			content: "HO"
		}]
	}


### Properties: the itemprop and itemref attributes

The itemprop attribute, when added to any widget that is part of an item, identifies a property of that item. The attribute must be an unordered set of unique space-separated tokens, representing the case-sensitive names of the properties that it adds. The attribute must contain at least one token.

Each token must be either a valid absolute URL or a a string that contains no "." (U+002E) characters and no ":" (U+003A) characters.

Vocabulary specifications must not define property names for Microdata that contain "." (U+002E) characters, ":" (U+003A) characters, nor space characters (defined in [HTML52] as U+0020, U+0009, U+000A, U+000C, and U+000D).

The property names of an element are determined as follows:

	Let tokens be the values of the itemprop attribute, Split on spaces.
	Let properties be an empty array of strings.
	For each value of token, in order:
	If the value is a repeated occurrence of an earlier value
	discard it and process the next value
	If the value is an absolute URL
	append it to properties, then process the next value
	Otherwise, if the the element is a typed item:
	Append the value to the vocabulary identifier for the item. If the the resulting value does not match any value in properties, then append it to properties, and process the next value.
	Otherwise
	append the value to properties and process the next value.
	If properties is not empty, return properties.

Within an item, the properties are unordered with respect to each other and authors must not rely on order in markup being preserved.

In the following example, the orer of the "a" and "b" properties is not important, as it is not guaranteed to be preserved in the resulting microdata:


	{
		type: "group",
		itemscope: true,
		content:[{
			type: "p",
			itemprop: "a",
			html: "1"
		},{
			type: "p",
			itemprop: "a",
			html: "2"
		},{
			type: "p",
			itemprop: "b",
			html: "1"
		}]
	}
	

Is equivalent to:


	{
		type: "group",
		itemscope: true,
		content:[{
			type: "p",
			itemprop: "b",
			html: "1"
		},{
			type: "p",
			itemprop: "a",
			html: "1"
		},{
			type: "p",
			itemprop: "a",
			html: "2"
		}]
	}

Widget with an itemscope attribute may have an itemref attribute specified, to give a list of additional elements to crawl to find the name-value pairs of the item.

The itemref attribute, if specified, must have a value that is an unordered set of unique space-separated tokens that are case-sensitive, consisting of IDs of elements in the same document.

The itemref attribute must not be specified on elements that do not have an itemscope attribute specified.

The preceding example:

	{
		type: "group",
		itemscope: true,
		content:[{
			type: "p",
			itemprop: "a",
			html: "1"
		},{
			type: "p",
			itemprop: "a",
			html: "2"
		},{
			type: "p",
			itemprop: "b",
			html: "1"
		}]
	}

Could also be written as follows:


	{
		type: "group",
		itemscope: true,
		id: "x",
		content:[{
			type: "p",
			itemprop: "a",
			html: "2"
		}]
	}
	
	{
		type: "group",
		itemscope: true,
		itemref: "x",
		content:[{
			type: "p",
			itemprop: "a",
			html: "1"
		},{
			type: "p",
			itemprop: "b",
			html: "1"
		}]
	}
	
When an element with an itemprop attribute adds a property to multiple items, the requirement above regarding the tokens applies for each item individually.

For the following code:

<div itemscope itemtype="http://example.com/a" itemref="x"></div>
<div itemscope itemtype="http://example.com/b" itemref="x"></div>
<meta id="x" itemprop="z" content="">

	{
		type: "group",
		itemscope: true,
		itemtype: "http://example.com/a",
		itemref: "x",
	}
	{
		type: "group",
		itemscope: true,
		itemtype: "http://example.com/b",
		itemref: "x",
	}
	{
		type: "meta",
		id: "x",
		itemprop: "z",
		content: ""
	}

The author should be certain that z is a valid property name for both the http://example.com/a and http://example.com/b vocabularies.

### Values: the content attribute, element-specific attributes and element content

The algorithm to determine the value for a name-value pair is given by applying the first matching case in the following list:

	If the element also has an itemscope attribute
	The value is the item created by the element.

	If the element has a content attribute
	The value is the textContent of the element's content attribute.

	WB only allows the content attribute on the meta widget. This specification changes the content model to allow it on any element, as a global attribute.
	
	If the element is an audio, embed, iframe, img, source, track, or video element
	
	If the element has a src attribute, let proposed value be the result of resolving that attribute's textContent. If proposed value is a valid absolute URL: The value is proposed value.

	otherwise The value is the empty string.

	If the element is an a, area, or link element
	
	If the element has an href attribute, let proposed value be the result of resolving that attribute's textContent. If proposed value is a valid absolute URL: The value is proposed value.
	otherwise The value is the empty string.

	If the element is an object element
	If the element has a data attribute, let proposed value be the result of resolving that attribute's textContent. If proposed value is a valid absolute URL: The value is proposed value.
	otherwise The value is the empty string.
	
	If the element is a data or meter element
	If the element has a value attribute, the value is that attribute's textContent.
	
	If the element is a time element
	If the element has a datetime attribute, the value is that attribute's textContent.
	
	Otherwise
	The value is the element's textContent.
	
	The URL property elements are the a, area, audio, embed, iframe, img, link, object, source, track, and video elements.
	
	If a property's value, as defined by the property's definition, is an absolute URL, the property must be specified using a URL property element.

These requirements do not apply just because a property value happens to match the syntax for a URL. They only apply if the property is explicitly defined as taking such a value.

For example, a book about the first moon landing, on the 20th of July 1967 could be called "mission:moon". A "title" property from a vocabulary that defines a title as a string would not expect the title to be given in an a element, even though it is a valid URL. On the other hand, if there was a vocabulary for "books whose titles look like URLs", whose "title" property whose content was defined as a URL, the property would expect the title to be given in an a element (or one of the other URL property elements), because of the requirement above.

### Associating names with items

To find the properties of an item defined by the element root, the user agent must run the following steps. These steps are also used to flag Microdata Errors.

	Let results, memory, and pending be empty lists of widgets.
	Add the widget root to memory.
	Add the child widgets of root, if any, to pending.

If root has an itemref attribute, split the value of that itemref attribute on spaces. For each resulting token ID, if there is an element in the document whose ID is ID, then add the first such element to pending.

	Loop: 
		If pending is empty, jump to the step labeled end of loop.
		Remove an element from pending and let current be that element.
		If current is already in memory, there is a Microdata Error; return to the step labeled loop.
		Add current to memory.
		If current does not have an itemscope attribute, then: add all the child elements of current to pending.
		If current has an itemprop attribute specified and has one or more property names, then add current to results.
		Return to the step labeled loop.
	End of loop: Sort results in tree order.
	Return results.

A document must not contain any items for which the to find the properties of an item finds any Microdata Error.

An item is a top-level Microdata item if its element does not have an itemprop attribute.

All itemref attributes in a Document must be such that there are no cycles in the graph formed from representing each item in the Document as a node in the graph and each property of an item whose value is another item as an edge in the graph connecting those two items.

A document must not contain an itemprop attribute that would not be a property of any item in that document were the properties all to be determined.

Microdata information can readily be expressed in a JSON form, including the JSON-LD format for RDF. This specification does not seek to limit such conversions, but other than defining a minimal conversion to RDFa which can be used to generate JSON-LD since they are both formally syntaces to express RDF, defines a "reference format". No current implemetation use of this format is known, but it is presented here for historical information.

Given a list of widgets in a Document, a user agent must run the following algorithm to extract the Microdata expressed as application/microdata+json:

	Let result be an empty object.
	Let items be an empty array.
	For each node in nodes, check if the element is a top-level Microdata item, and if it is then get the object for that element and add it to items.
	Add an entry to result called "items" whose value is the array items.
	Return the result of serializing result to JSON in the shortest possible way (meaning no whitespace between tokens, no unnecessary zero digits in numbers, and only using Unicode escapes in strings for characters that do not have a dedicated escape sequence), and with a lowercase "e" used, when appropriate, in the representation of any numbers. [JSON]

This algorithm returns an object with a single property that is an array, instead of just returning an array, so that it is possible to extend the algorithm in the future if necessary.

When the user agent is to get the object for an item item, potentially together with a list of elements memory, it must run the following substeps:

	Let result be an empty object.
	If no memory was passed to the algorithm, let memory be an empty list.
	Add item to memory.
	If the item has any item types, add an entry to result called "type" whose value is an array listing the item types of item, in the order they were specified on the itemtype attribute.
	If the item has a global identifier, add an entry to result called "id" whose value is the global identifier of item.
	Let properties be an empty object.
	For each element element that has one or more property names and is one of the properties of the item item, in the order those elements are given by the algorithm that returns the properties of an item, run the following substeps:
	Let value be the property value of element.
	If value is an item, then: If value is in memory, then let value be the string "ERROR". Otherwise, get the object for value, passing a copy of memory, and then replace value with the object returned from those steps.
	For each name name in element's property names, run the following substeps:
	If there is no entry named name in properties, then add an entry named name to properties whose value is an empty array.
	Append value to the entry named name in properties.
	Add an entry to result called "properties" whose value is the object properties.
	Return result.

For example, take this markup:

	{
		type: "group",
		content: [{
			type: "p",
			html: "My Blog",
		}, {
			type: "group",
			itemscope: true,
			itemtype: "https://schema.org/BlogPosting",
			content: [{
				type: "h1",
				itemprop: "headline",
				html: "Progress report"
			},{
				type: "time",
				itemprop: "datePublished" ,
				content: "2013-08-29",
				html: "today"
			},{
				type: "link",
				itemprop: "rul" ,
				href: "?comments=0"
			},{
				type: "p",
				html: "All in all, he's doing well with his swim lessons. The biggest thing was he had trouble
	 putting his head in, but we got it down."
			}, {
				type: "group",
				content:[{
					type: "h1",
					html: "Comments"
				},{
					type: "group",
					itemscop: true,
					itemtype: "",
					id: "c1",
					content: [{
						type: "link",
						itemprop: "url",
						href: "#c1"
					},{
						type: "group",
						name: "footer",
						content: [{
							type: "group",
							itemscope: true,
							
						}]
					}]
				}]
			}]
		}]
	}


It would be turned into the following JSON by the algorithm above (supposing that the page's URL was http://blog.example.com/progress-report):

	{
	  "items": [
	    {
	      "type": [ "https://schema.org/BlogPosting" ],
	      "properties": {
	        "headline": [ "Progress report" ],
	        "datePublished": [ "2013-08-29" ],
	        "url": [ "http://blog.example.com/progress-report?comments=0" ],
	        "comment": [
	          {
	            "type": [ "https://schema.org/Comment" ],
	            "properties": {
	              "url": [ "http://blog.example.com/progress-report#c1" ],
	              "creator": [
	                {
	                  "type": [ "https://schema.org/Person" ],
	                  "properties": {
	                    "name": [ "Greg" ]
	                  }
	                }
	              ],
	              "dateCreated": [ "2013-08-29" ]
	            }
	          },
	          {
	            "type": [ "https://schema.org/Comment" ],
	            "properties": {
	              "url": [ "http://blog.example.com/progress-report#c2" ],
	              "creator": [
	                {
	                  "type": [ "https://schema.org/Person" ],
	                  "properties": {
	                    "name": [ "Charlotte" ]
	                  }
	                }
	              ],
	              "dateCreated": [ "2013-08-29" ]
	            }
	          }
	        ]
	      }
	    }
	  ]
	}

## Changes to Widget

### New attributes

This specification adds the following global attributes and associated validity constraints to widgets:

- itemscope: This is a boolean attribute. When present on an element, it identifies that element as the container for an item
- itemtype: This is a list of absolute URLs that identify an item within a particular vocabulary. The itemtype attribute must not be specified on elements that do not have an itemscope attribute.
- itemprop: When present on an element, it identifies that the element provides the property value of the item in which it appears, and the attribute's value defines the property name.
- itemid: This is an absolute URL that provides a global identifier for an item.
The itemid attribute must not be specified on elements that do not have an itemscope attribute specified.
- itemref: This is a space seperated list of IDs of elements which are not descendants of the element on which it appears. It identifies each element whose ID it includes as defining a property of the item on which it is present. The itemref attribute must not be specified on elements that do not have an itemscope attribute.

### Content models

This section changes the content models defined by HTML in the following ways:

The content attribute redefined by this specification as a global attribute that may be present on that widget.

This is consistent with [HTML-RDFA], which uses the attribute for the same purpose.

If the itemprop attribute is present on a link or meta element, that element is flow content and phrasing content, and may be used where phrasing content is expected.

If a link element has an itemprop attribute, the rel attribute may be omitted.

If a meta element has an itemprop attribute, the name, http-equiv, and charset attributes must be omitted, and the content attribute must be present.

If the itemprop attribute is specified on an a or area element, then the href attribute must also be specified.

If the itemprop attribute is specified on an audio, embed, iframe, img, source, track, or video element, then the src attribute must also be specified.

If the itemprop attribute is specified on an object element, then the data attribute must also be specified.

## Widget Microdata and RDF

Microdata has limited expressivity. There are only two types of data - text strings, and URLs, and microdata does not have a mechanism to describe further datatypes such as numbers or fragments of markup in an interoperable way, or include information such as language, unlike RDF formats including RDFa. To support retaining markup structure, internationalization information, or for more expressivity, authors should consider using [JSON-LD] or [rdfa-core] instead of, or as well as, microdata.

Information expressed as Microdata can be converted to RDFa as described in Section 6. [rdfa-core], A richer process to convert Microdata to RDF, that extends the minimal one required by this specification, is described in Microdata to RDF. [microdata-rdf]

## Accessibility and Microdata

Microdata can be used to provide machine-parseable information about content that is processed by tools to improve accessibility.

When editing content that contains Microdata, authors should consider the possibility that this is the case. Authoring and content management tools should implement the Authoring Tool Accessibility Guidelines, and in this context note Guideline B1.1.2 - Ensure Accessibility Information is Preserved, if applicable drawing attention to the fact that changes in content may mean the encoded metadata is not accurate. [ATAG20]

Authors should be aware that a great deal of accessibility information is ignored in extracting Microdata, including attributes such as alt and ARIA information. Authors should consider whether to encode accessibility information explicitly, or to use a more expressive approach such as RDFa. [rdfa-core]

## Internationalisation and localisation

Microdata does not preserve internationalization-related information in the source document, except if it is specifically encoded as Microdata. In that case it is important to pay attention when editing the source document, as with accessibility, to avoid introducing errors that are only reflected in the microdata. This approach also has the disadvantage that the representation of such information is not based on an established standard, so it may not be understood by downstream processors and users of the information.

Machine-readable data may be presented to users, for example by search engines. Internationalization information is often important for this use case. Authors may prefer to convert their data to RDFa to take advantage of its better support for Internationalization.

Vocabulary design is difficult. Different languages and cultures present view ambiguity differently: two terms with different meanings in one situation may be most naturally translated by a single term that has both meanings, or a single term may have two natural translations. When developing for localisation, it is important to provide sufficient contextual information about terms in a vocabulary to enable accurate translation.

## Privacy Considerations

Microdata does not introduce new mechanisms to transmit privacy-sensitive information. However it more clearly identifies information, in a way that facilitates finding data and merging it with data from other sources.

Authors and processors should take care to ensure that their use of Microdata is in line with privacy policies and any applicable regulation.

## Security Considerations

Microdata does not generally interact with browsers, being a static document format that lacks any DOM interface.

Microdata makes information machine-readable, but does not automatically include provenance information for the statements it encodes.

Processors of Microdata should consider the trustworthiness of sources they use, including the possibility that data is no longer accurate, and the possibility that data gathered over an insecure connection has been altered by a "man-in-the-middle" attack.

## Changes

An exact history of changes to the text is available in the Github commit log. The following information is provided as an overview of the substantive changes made to the specification between each publication.

Changes made between the current draft and the third Working Draft:

Specify that properties and their values are unordered.
Remove the Microdata to JSON-LD conversion.
Mark Microdata to JSON conversion as an obsolete but conforming feature.
Changes made between the third Working Draft and the second Working Draft:


## Acknowledgements

The original specification for Widget Microdata was developed by Mostafa Barmshory. Without him this specification would not exist. Uptake has substantially been driven by its use for the schema.org vocabulary.

The current editors would particularly like to thank Gregg Kellogg and Ivan Herman for invaluable help including providing implementation experience and testing during the development of this specification.

In addition thanks are due to the following people whose direct contributions have helped improve this work:

Addison Phillips, Bruce Lawson, Christine Runnegar, Jeni Tennison, Jens Oliver Meiert, Léonie Watson, Manu Sporny, Marcos Cáceres, Markus Lanthaler, Nick Doty, Nick Levinson, Philippe Le Hégaret, Ralph Swick, Richard Ishida, Rob Sanderson, Robin Berjon, Shane McCarron, Tab Atkins, Tavis Tucker, Tobie Langel, "Unor", Xiaoqian Wu, Yves Lafon.

The editors apologise to people whose names have undeservedly been missed in this list.

# References

## Normative references

[DOM41] W3C DOM 4.1. Yongsheng Zhu. W3C. 1 February 2018. W3C Working Draft. URL: https://www.w3.org/TR/dom41/

[HTML52] HTML 5.2. Steve Faulkner; Arron Eicholz; Travis Leithead; Alex Danilo; Sangwhan Moon. W3C. 14 December 2017. W3C Recommendation. URL: https://www.w3.org/TR/html52/

[RFC2119] Key words for use in RFCs to Indicate Requirement Levels. S. Bradner. IETF. March 1997. Best Current Practice. URL: https://tools.ietf.org/html/rfc2119

[RFC3986] Uniform Resource Identifier (URI): Generic Syntax. T. Berners-Lee; R. Fielding; L. Masinter. IETF. January 2005. Internet Standard. URL: https://tools.ietf.org/html/rfc3986

## Informative references

[ATAG20] Authoring Tool Accessibility Guidelines (ATAG) 2.0. Jan Richards; Jeanne F Spellman; Jutta Treviranus. W3C. 24 September 2015. W3C Recommendation. URL: https://www.w3.org/TR/ATAG20/

[html-extensions] HTML Extension Specifications. Léonie Watson. W3C. 3 May 2017. W3C Editor's Draft. URL: https://w3c.github.io/html-extensions/

[HTML-RDFA] HTML+RDFa 1.1 - Second Edition. Manu Sporny. W3C. 17 March 2015. W3C Recommendation. URL: https://www.w3.org/TR/html-rdfa/

[JSON] The application/json Media Type for JavaScript Object Notation (JSON). D. Crockford. IETF. July 2006. Informational. URL: https://tools.ietf.org/html/rfc4627

[JSON-LD] JSON-LD 1.0. Manu Sporny; Gregg Kellogg; Markus Lanthaler. W3C. 16 January 2014. W3C Recommendation. URL: https://www.w3.org/TR/json-ld/

[microdata-rdf] Microdata to RDF – Second Edition. Gregg Kellogg. W3C. 16 December 2014. W3C Note. URL: https://www.w3.org/TR/microdata-rdf/

[owl-ref] OWL Web Ontology Language Reference. Mike Dean; Guus Schreiber. W3C. 10 February 2004. W3C Recommendation. URL: https://www.w3.org/TR/owl-ref/

[rdf-primer] RDF Primer. Frank Manola; Eric Miller. W3C. 10 February 2004. W3C Recommendation. URL: https://www.w3.org/TR/rdf-primer/

[rdfa-core] RDFa Core 1.1 - Third Edition. Ben Adida; Mark Birbeck; Shane McCarron; Ivan Herman et al. W3C. 17 March 2015. W3C Recommendation. URL: https://www.w3.org/TR/rdfa-core/

[URL] URL Standard. Anne van Kesteren. WHATWG. Living Standard. URL: https://url.spec.whatwg.org/
