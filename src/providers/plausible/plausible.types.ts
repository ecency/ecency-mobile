

export interface StatsResponseResult {
    metrics: number[];
    dimensions: string[];
}

export interface StatsResponse {
    results: StatsResponseResult[];
    query: {
      site_id: string;
      metrics: string[];
      date_range: string[];
      filters: unknown[];
    };
  }


//NOTE: this interface is also used to update
export interface PostStats {
  visitors:number, 
  pageviews:number, 
  visit_duration:number,
}

export interface PostStatsByCountry {
  country:string,
  stats:PostStats
}