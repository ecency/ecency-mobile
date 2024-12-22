

export interface StatsResponse {
    results: [
      {
        metrics: number[];
        dimensions: string[];
      }
    ];
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