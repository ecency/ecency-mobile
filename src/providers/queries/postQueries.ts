import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAppSelector } from "../../hooks";
import { getPost } from "../hive/dhive";
import QUERIES from "./queryKeys";

/** hook used to return user drafts */
export const useGetPostQuery = (_author?:string, _permlink?:string) => {
  
    const currentAccount = useAppSelector(state=>state.account.currentAccount);

    const [author, setAuthor] = useState(_author)
    const [permlink, setPermlink] = useState(_permlink)

    const query = useQuery([QUERIES.POST.GET, author, permlink], async () => {
        if(!author || !permlink){
            return null;
        }

        try {
            const post = await getPost(author, permlink, currentAccount?.username );
            if(post?.post_id > 0){
                return post;
            }

            new Error("Post unavailable")
            
        } catch(err){
            console.warn("Failed to get post", err);
            throw err;
        }
       
    });

    return {
        ...query,
        setAuthor,
        setPermlink,
    }
  };