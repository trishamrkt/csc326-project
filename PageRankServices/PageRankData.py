import pymongo
from pymongo import MongoClient

class PageRankData():

    def __init__(self):
        # Establish MongoDB Connections
        self.client = MongoClient('localhost', 27017)
        self.db = self.client.GoogaoDB

        self.__inbound = {};
        self.__outbound = {};
        self.__page_rank = {};
        self.__num_links = {};

    """ DATABASE ACCESS FUNCTIONS:
        All follow 3 steps:
        1. Connect to appropriate collection within GoogaoDB
        2. Query collection for desired value (will obtain a dictionary)
        3. Return desired value from dictionary
    """
    def access_collections(self, collection_name, query_key, query_val, desired_key):
        # 1.
        collection = self.db[collection_name]

        # 2. Obtain desired dictionary from collection
        dictionary = collection.find_one({query_key : query_val})

        # 3.
        desired_val = dictionary[desired_key]
        return desired_val

    def get_inbound(self):
        inbound_coll = self.db["inbound"];
        return {x['url']:x['inbound_urls'] for x in inbound_coll.find()}

    # Input: url
    # Return array: links that point to url
    def get_inbound_urls(self, url):
        inbound_coll = self.db["inbound"]
        urls = [x['url'] for x in inbound_coll.find()]
        if urls in url:
            return self.access_collections("inbound", "url", url, "inbound_urls")
        else:
            return None

    def get_outbound(self):
        outbound_coll = self.db["outbound"];
        return {x['url']:x['outbound_urls'] for x in outbound_coll.find()}

    # Input: url
    # Return array: links on url page that point to other links in url.txt
    def get_outbound_urls(self, url):
        outbound = self.access_collections("outbound", "url", url, "outbound_urls")
        return outbound

    def get_all_num_links(self):
        num_links_coll = self.db["num_links"];
        return {x['url']:x['num_links'] for x in num_links_coll.find()}

    # Input: url
    # Return int: number of links on the url page
    def get_num_links(self, url):
        num_links = access_collections("num_links", "url", url, "num_links")
        return num_links

    def get_all_page_ranks(self):
        pageranks_coll = self.db["page_rank"];
        return {x['url']:x['rank'] for x in pageranks_coll.find()}

    # Input: url
    # Return float: pagerank of url taken from pagerank algorithm
    def get_page_rank(self, url):
        page_rank = self.access_collections("page_rank", "url", url, "rank")
        return page_rank

    """ DATABASE UPDATE FUNCTIONS:
        All follow 2 steps:
        1. Connect to appropriate collection within GoogaoDB
        2. Set query dictionary to updated value
    """
    def update_collections(self, collection_name, query_key, query_val, update_key, update_val):
        # 1.
        collection = self.db[collection_name]

        # 2.
        collection.update_one({query_key : query_val},  {'$set' : {update_key : update_val}}, upsert=True)

    # Update page rank of url
    def update_page_rank(self, url, new_rank):
        self.update_collections("page_rank", "url", url, "rank", new_rank);

    # Update inbound urls for url
    def update_inbound(self, url, new_inbound):
        self.update_collections("inbound", "url", url, "inbound_urls", new_inbound)

    # Update outbound urls for url
    def update_outbound(self, url, new_outbound):
        self.update_collections("outbound", "url", url, "outbound_urls", new_outbound)

    def update_num_links(self, url, new_num_links):
        self.update_collections("num_links", "url", url, "num_links", new_num_links)

    def close_connection(self):
        self.client.close()
