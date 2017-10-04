from bottle import *
from WebScrapingServices.CrawlerService import *
from ResultsPageServices.TopTwenty import TopTwenty
from ResultsPageServices.WordData import WordData
from HTMLFormatter.HtmlHelper import results_html

crawlerService = CrawlerService();
mostPopular = TopTwenty();

@route('/')
def root_path():
    if request.query_string == '':
        return template('index')
    else:
        return results_html(request.query['keywords'].lower(), mostPopular);

@get('/static/css/<filepath:re:.*\.css>')
def static(filepath):
    return static_file(filepath, root='static/css')


if __name__ == '__main__':
    run(host='localhost', port=8000, debug=True);
