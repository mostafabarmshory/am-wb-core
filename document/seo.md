# Getting started with WEBURGER SEO

Most webmasters are familiar with WEBURGER widgets on their pages. Usually, widgets tell the browser how to display the information included in the widget. For example, a text widget tells the browser to display a text string in a heading, paragraph and etc. format. However, the text widget doesn't give any information about what that text string means- the text could refer to the hugely successful 3D movie, or it could refer to a type of profile picture—and this can make it more difficult for search engines to intelligently display relevant content to a user.

WEBURGER SEO provides a collection of shared vocabularies webmasters can use to mark up their pages in ways that can be understood by the major search engines: Google, Microsoft, Yandex and Yahoo! All of these vocabularies are from Schema.org which is the leading group in SEO.

You use the schema.org vocabulary along with the widget formats to add information to your Web content. This guide will help get you up to speed with widgets and schema.org so that you can start adding SEO information to your web pages.

This document is a copy of GETING START from schema.org but with WEBURGER princibles. Although this guide focuses on widgets, there are examples on the schema.org site show in Microdata, RDFa and JSON-LD too. The basic ideas (categories, properties etc.) introduced here are relevant beyond Microdata from schema.org.


## How to mark up your content

### Why use SEO?

Your web pages have an underlying meaning that people understand when they read the web pages. But search engines have a limited understanding of what is being discussed on those pages. By adding additional properties to the widgets of your pages you can help search engines and other applications better understand your content and display it in a useful, relevant way. SEO is a set of attributes that allows you to do this.

### Categories

Let's start with a concrete example. Imagine you have a page about the movie Avatar—a page with a link to a movie trailer, information about the director, and so on. Your page design  might look something like this:

	{
		"type":"group",
		"contents": [{
			"type":"text",
			"text": "<h1>Avatar</h1>"
		},{
			"type":"text",
			"text": "<span>Director: James Cameron (born August 16, 1954)</span>"
		},{
			"type":"text",
			"text": "<span>Science fiction</span>"
		},{
			"type":"text",
			"text": "<a href="../movies/avatar-theatrical-trailer.html">Trailer</a>"
		}]
	}

To begin, identify the section of the page that is "about" the movie Avatar. To do this, add the category element to the widget that encloses information about the item, like this:

	{
		"type":"group",
		"category": "http://schema.org/Movie"
		"contents": [{
			"type":"text",
			"text": "<h1>Avatar</h1>"
		},{
			"type":"text",
			"text": "<span>Director: James Cameron (born August 16, 1954)</span>"
		},{
			"type":"text",
			"text": "<span>Science fiction</span>"
		},{
			"type":"text",
			"text": "<a href="../movies/avatar-theatrical-trailer.html">Trailer</a>"
		}]
	}

By adding category, you are specifying that the widgets contained in the group widget is about a particular item. But it's not all that helpful to specify that there is an item being discussed without specifying what kind of an item it is. You can specify the type of item using the category value. This specifies that widgets contained in the group is in fact a Movie, as defined in the schema.org type hierarchy. Item types are provided as URLs, in this case http://schema.org/Movie.

### itemprop

What additional information can we give search engines about the movie Avatar? Movies have interesting properties such as actors, director, ratings. To label properties of an item, use the 'property' attribute. For example, to identify the director of a movie, add "Property":"director" to the text widget contains the director's name. (There's a full list of all the properties you can associate with a movie at http://schema.org/Movie.)


	{
		"type":"group",
		"category": "http://schema.org/Movie"
		"contents": [{
			"type":"text",
			"property":"title",
			"text": "<h1>Avatar</h1>"
		},{
			"type":"text",
			"property":"director",
			"text": "<span>Director: James Cameron (born August 16, 1954)</span>"
		},{
			"type":"text",
			"property":"genre",
			"text": "<span>Science fiction</span>"
		},{
			"type":"text",
			"property":"trailer",
			"text": "<a href="../movies/avatar-theatrical-trailer.html">Trailer</a>"
		}]
	}

Note that we have added additional widgets tags to attach the property attributes to the appropriate text on the group. Search engines can now understand not just that http://www.avatarmovie.com is a URL, but also that it's the URL for the trailer for the science-fiction movie Avatar, which was directed by James Cameron.

### Embedded category

Sometimes the value of an category property can itself be another category with its own set of properties. For example, we can specify that the director of the movie is an category of type Person and the Person has the properties name and birthDate. To specify that the value of a property is another category, you begin a new group widget immediately after the corresponding group.


	{
		"type":"group",
		"category": "http://schema.org/Movie"
		"contents": [{
			"type":"text",
			"property":"title",
			"text": "<h1>Avatar</h1>"
		},{
			"type":"group",
			"property":"director",
			"category":"http://schema.org/Person",
			"contents":[{
				"type": "text",
				"text": "<span>Director:</span>"
			},{
				"type": "text",
				"property": "name",
				"text": "<span>James Cameron</span>"
			},{
				"type": "text",
				"property": "birthDate",
				"text": "<span>(August 16, 1954)</span>"
			}]
		},{
			"type":"text",
			"property":"genre",
			"text": "<span>Science fiction</span>"
		},{
			"type":"text",
			"property":"trailer",
			"text": "<a href="../movies/avatar-theatrical-trailer.html">Trailer</a>"
		}]
	}

## Using the schema.org vocabulary

### Categories and properties

Not all web pages are about movies and people—in addition to the Movie and Person types described in section 1, schema.org describes a variety of other categories-which is called items-, each of which has its own set of properties that can be used to describe the item.

The broadest item type is Thing, which has four properties: name, description, url, and image. More specific types share properties with broader types. For example, a Place is a more specific type of Thing, and a LocalBusiness is a more specific type of Place. More specific items inherit the properties of their parent. (Actually, a LocalBusiness is a more specific type of Place and a more specific type of Organization, so it inherits properties from both parent types.)

Here's a set of commonly used item types:

- Creative works: CreativeWork, Book, Movie, MusicRecording, Recipe, TVSeries ...
- Embedded non-text objects: AudioObject, ImageObject, VideoObject
- Event
- Organization
- Person
- Place, LocalBusiness, Restaurant ...
- Product, Offer, AggregateOffer
- Review, AggregateRating

You can also see a [full list of all categories(item types)](https://schema.org/docs/full.html), listed on a single page.


### Expected types, text, and URLs

Here are a few notes to keep in mind when adding SEO to your web pages.

More is better, except for hidden text. In general, the more content you mark up, the better. However, as a general rule, you should mark up only the content that is visible to people who visit the web page and not content in hidden div's or other hidden page elements.

Expected categories vs text. When browsing the schema.org types, you will notice that many properties have "expected types". This means that the value of the property can itself be an embedded item (see section 1d: embedded category). But this is not a requirement—it's fine to include just regular text or a URL. In addition, whenever an expected category is specified, it is also fine to embed a category that is a child category of the expected category. For example, if the expected category is Place, it's also OK to embed a LocalBusiness.

Using the url property. Some web pages are about a specific category. For example, you may have a web page about a single person, which you could mark up using the Person category. Other pages have a collection of categories described on them. For example, your company site could have a page listing employees, with a link to a profile page for each person. For pages like this with a collection of items, you should mark up each category separately (in this case as a series of Persons) and add the url property to the link to the corresponding page for each category , like this:

	{
		"type": "group",
		"contents":[{
			"type":"group",
			"category": "http://schema.org/Person",
			"contents": [{
				"type":"link",
				"property":"url",
				"text": "Alice Jones",
				"url": "alice.html"
			}]
		},{
			"type":"group",
			"category": "http://schema.org/Person",
			"contents": [{
				"type":"link",
				"property":"url",
				"text": "Bob Smith",
				"url": "bob.html"
			}]
		}]
	}

### Testing your markup

Much like a web browser is important for testing changes to your web page layout, and a code compiler is important for testing code you write, you should also test your schema.org markup to make sure it is configured correctly. Google provides a rich snippets testing tool, which you can use to test your markup and identify any errors.

TODO: maso, 2018: add a test tool

## Advanced topic: Machine-understandable versions of information

Many pages can be described using only the category and properties (described in section 1) along with the types and properties defined on schema.org (described in section 2).

However, sometimes an item property is difficult for a machine to understand without additional disambiguation. This section describes how you can provide machine-understandable versions of information when marking up your pages.

- Dates, times, and durations: use the time tag with datetime
- Enumerations and canonical references: use the link tag with href
- Missing/implicit information: use the meta tag with content.


### Dates, times, and durations: use the time tag with datetime

Dates and times can be difficult for machines to understand. Consider the date "04/01/11". Does it mean January 11, 2004? January 4, 2011? Or April 1, 2011? To make dates unambiguous, use the time tag along with the datetime attribute. The value of the datetime attribute is the date specified using YYYY-MM-DD format. The HTML code below specifies the date unambiguously as April 1, 2011.

	<time datetime="2011-04-01">04/01/11</time>

You can also specify a time within a day, using the hh:mm or hh:mm:ss format. Times are prefixed with the letter T and can be provided along with a date, like this:

	<time datetime="2011-05-08T19:30">May 8, 7:30pm</time>

Let's see this in context. Here's some HTML describing a concert taking place on May 8, 2011. The Event markup includes the name of the event, a description, and the date of the event.

	<div itemscope itemtype="http://schema.org/Event">
	  <div itemprop="name">Spinal Tap</div>
	  <span itemprop="description">One of the loudest bands ever
	  reunites for an unforgettable two-day show.</span>
	  Event date:
	  <time itemprop="startDate" datetime="2011-05-08T19:30">May 8, 7:30pm</time>
	</div>

Durations can be specified in an analogous way using the time tag with the datetime attribute. Durations are prefixed with the letter P (stands for "period"). Here's how you can specify a recipe cook time of 1 ½ hours:

	<time itemprop="cookTime" datetime="PT1H30M">1 1/2 hrs</time>

H is used to designate the number of hours, and M is used to designate the number of minutes.

The date, time, and duration standards are specified by the ISO 8601 date/time standard.

### Enumerations and canonical references: use link with href

#### Enumerations

Some properties can take only a limited set of possible values. Programmers often call these "enumerations." For example, an online store with an item for sale could use the Offer item type to specify the details of the offer. The availability property can typically have one of only a few possible values—In stock, Out of stock, Pre-order, and so on. Much like item types are specified as URLs, possible values for an enumeration on schema.org can also be specified as URLs.

Here is an item for sale, marked up with the Offer type and relevant properties:

	<div itemscope itemtype="http://schema.org/Offer">
	  <span itemprop="name">Blend-O-Matic</span>
	  <span itemprop="price">$19.95</span>
	  <span itemprop="availability">Available today!</span>
	</div>

And here is the same item, but using link and href to unambiguously specify the availability as one of the permitted values:

	<div itemscope itemtype="http://schema.org/Offer">
	  <span itemprop="name">Blend-O-Matic</span>
	  <span itemprop="price">$19.95</span>
	  <link itemprop="availability" href="http://schema.org/InStock"/>Available today!
	</div>

Schema.org provides enumerations for a handful of properties—typically wherever there are a limited number of typical values for a property, there is a corresponding enumeration specified in schema.org. In this case, the possible values for availability are specified in ItemAvailability.

#### Canonical references

Typically, links are specified using the <a> element. For example, the following HTML links to the Wikipedia page for the book Catcher in the Rye.

	<div itemscope itemtype="http://schema.org/Book">
	  <span itemprop="name">The Catcher in the Rye</span>—
	  by <span itemprop="author">J.D. Salinger</span>
	  Here is the book's <a itemprop="url" href="http://en.wikipedia.org/wiki/The_Catcher_in_the_Rye">Wikipedia page</a>.
	</div>

As you can see, itemprop="url" can be used to specify a link to a page on another site (in this case Wikipedia) discussing the same item. Links to 3rd party sites can help search engines to better understand the item you are describing on your web page.

However, you might not want to add a visible link on your page. In this case, you can use a link element instead, as follows:

	<div itemscope itemtype="http://schema.org/Book">
	  <span itemprop="name">The Catcher in the Rye</span>—
	  <link itemprop="url" href="http://en.wikipedia.org/wiki/The_Catcher_in_the_Rye" />
	  by <span itemprop="author">J.D. Salinger</span>
	</div>

### Missing/implicit information: use the meta tag with content

Sometimes, a web page has information that would be valuable to mark up, but the information can't be marked up because of the way it appears on the page. The information may be conveyed in an image (for example, an image used to represent a rating of 4 out of 5) or a Flash object (for example, the duration of a video clip), or it may be implied but not stated explicitly on the page (for example, the currency of a price).

In these cases, use the meta tag along with the content attribute to specify the information. Consider this example—the image shows users a 4 out of 5 star rating:

	<div itemscope itemtype="http://schema.org/Offer">
	  <span itemprop="name">Blend-O-Matic</span>
	  <span itemprop="price">$19.95</span>
	  <img src="four-stars.jpg" />
	  Based on 25 user ratings
	</div>

Here is the example again with the rating information marked up.

	<div itemscope itemtype="http://schema.org/Offer">
	  <span itemprop="name">Blend-O-Matic</span>
	  <span itemprop="price">$19.95</span>
	  <div itemprop="reviews" itemscope itemtype="http://schema.org/AggregateRating">
	    <img src="four-stars.jpg" />
	    <meta itemprop="ratingValue" content="4" />
	    <meta itemprop="bestRating" content="5" />
	    Based on <span itemprop="ratingCount">25</span> user ratings
	  </div>
	</div>

This technique should be used sparingly. Only use meta with content for information that cannot otherwise be marked up.

### Extending schema.org

Most sites and organizations will not have a reason to extend schema.org. However, schema.org offers the ability to specify additional properties or sub-types to existing types. If you are interested in doing this, read more about the schema.org extension mechanism.

