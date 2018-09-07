import Remarkable from "remarkable";
import { postSummary } from "./postSummary";
import { reputation } from "./reputation";
import moment from "moment";

const md = new Remarkable({ html: true, breaks: true, linkify: true });

export const replaceAuthorNames = input => {
    return input.replace(
        /* eslint-disable-next-line */
        /(^|[^a-zA-Z0-9_!#$%&*@＠\/]|(^|[^a-zA-Z0-9_+~.-\/]))[@＠]([a-z][-\.a-z\d]+[a-z\d])/gi,
        (match, preceeding1, preceeding2, user) => {
            const userLower = user.toLowerCase();
            const preceedings = (preceeding1 || "") + (preceeding2 || "");

            return `${preceedings}<a class="markdown-author-link" href="${userLower}" data-author="${userLower}">@${user}</a>`;
        }
    );
};

export const replaceTags = input => {
    return input.replace(/(^|\s|>)(#[-a-z\d]+)/gi, tag => {
        if (/#[\d]+$/.test(tag)) return tag; // do not allow only numbers (like #1)
        const preceding = /^\s|>/.test(tag) ? tag[0] : ""; // space or closing tag (>)
        tag = tag.replace(">", ""); // remove closing tag
        const tag2 = tag.trim().substring(1);
        const tagLower = tag2.toLowerCase();
        return (
            preceding +
            `<a class="markdown-tag-link" href="${tagLower}" data-tag="${tagLower}">${tag.trim()}</a>`
        );
    });
};

export const markDown2Html = input => {
    if (!input) {
        return "";
    }

    // Start replacing user names
    let output = replaceAuthorNames(input);

    // Replace tags
    output = replaceTags(output);

    output = md.render(output);

    /* eslint-disable */
    const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))/gim;
    const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w\.\d-]+)\/(.*)/i;
    const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
    const vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const dTubeRegex = /(https?:\/\/d.tube.#!\/v\/)(\w+)\/(\w+)/g;
    /* eslint-enable */

    // TODO: Implement Regex

    return output;
};

export const parsePosts = (posts, user) => {
    posts.map(post => {
        post.json_metadata = JSON.parse(post.json_metadata);
        post.json_metadata.image
            ? (post.image = post.json_metadata.image[0])
            : "";
        post.pending_payout_value = parseFloat(
            post.pending_payout_value
        ).toFixed(2);
        post.created = moment
            .utc(post.created)
            .local()
            .fromNow();
        post.vote_count = post.active_votes.length;
        post.author_reputation = reputation(post.author_reputation);
        post.avatar = `https://steemitimages.com/u/${post.author}/avatar/small`;
        post.body = markDown2Html(post.body);
        post.summary = postSummary(post.body, 100);
        post.raw_body = post.body;
        post.active_votes.sort((a, b) => {
            return b.rshares - a.rshares;
        });

        let totalPayout =
            parseFloat(post.pending_payout_value) +
            parseFloat(post.total_payout_value) +
            parseFloat(post.curator_payout_value);

        let voteRshares = post.active_votes.reduce(
            (a, b) => a + parseFloat(b.rshares),
            0
        );
        let ratio = totalPayout / voteRshares;
        post.isVoted = false;

        for (let i in post.active_votes) {
            if (post.active_votes[i].voter == user) {
                post.isVoted = true;
            }
            post.active_votes[i].value = (
                post.active_votes[i].rshares * ratio
            ).toFixed(2);
            post.active_votes[i].reputation = reputation(
                post.active_votes[i].reputation
            );
            post.active_votes[i].percent = post.active_votes[i].percent / 100;
            post.active_votes[i].avatar =
                "https://steemitimages.com/u/" +
                post.active_votes[i].voter +
                "/avatar/small";
        }

        if (post.active_votes.length > 2) {
            post.top_likers = [
                post.active_votes[0].voter,
                post.active_votes[1].voter,
                post.active_votes[2].voter,
            ];
        }
    });
    return posts;
};

export const parsePost = post => {
    post.json_metadata = JSON.parse(post.json_metadata);
    post.json_metadata.image ? (post.image = post.json_metadata.image[0]) : "";
    post.pending_payout_value = parseFloat(post.pending_payout_value).toFixed(
        2
    );
    post.created = moment
        .utc(post.created)
        .local()
        .fromNow();
    post.vote_count = post.active_votes.length;
    post.author_reputation = reputation(post.author_reputation);
    post.avatar = `https://steemitimages.com/u/${post.author}/avatar/small`;
    post.body = markDown2Html(post.body);
    post.summary = postSummary(post.body, 100);
    post.raw_body = post.body;
    post.active_votes.sort((a, b) => {
        return b.rshares - a.rshares;
    });
    let totalPayout =
        parseFloat(post.pending_payout_value) +
        parseFloat(post.total_payout_value) +
        parseFloat(post.curator_payout_value);

    let voteRshares = post.active_votes.reduce(
        (a, b) => a + parseFloat(b.rshares),
        0
    );
    let ratio = totalPayout / voteRshares;

    for (let i in post.active_votes) {
        post.active_votes[i].value = (
            post.active_votes[i].rshares * ratio
        ).toFixed(2);
        post.active_votes[i].reputation = reputation(
            post.active_votes[i].reputation
        );
        post.active_votes[i].percent = post.active_votes[i].percent / 100;
        post.active_votes[i].avatar =
            "https://steemitimages.com/u/" +
            post.active_votes[i].voter +
            "/avatar/small";
    }

    if (post.active_votes.length > 2) {
        post.top_likers = [
            post.active_votes[0].voter,
            post.active_votes[1].voter,
            post.active_votes[2].voter,
        ];
    }
    return post;
};

export const protocolUrl2Obj = url => {
    let urlPart = url.split("://")[1];

    // remove last char if /
    if (urlPart.endsWith("/")) {
        urlPart = urlPart.substring(0, urlPart.length - 1);
    }

    const parts = urlPart.split("/");

    // filter
    if (parts.length === 1) {
        return { type: "filter" };
    }

    // filter with tag
    if (parts.length === 2) {
        return { type: "filter-tag", filter: parts[0], tag: parts[1] };
    }

    // account
    if (parts.length === 1 && parts[0].startsWith("@")) {
        return { type: "account", account: parts[0].replace("@", "") };
    }

    // post
    if (parts.length === 3 && parts[1].startsWith("@")) {
        return {
            type: "post",
            cat: parts[0],
            author: parts[1].replace("@", ""),
            permlink: parts[2],
        };
    }
};

export const parseComments = comments => {
    comments.map(comment => {
        comment.pending_payout_value = parseFloat(
            comment.pending_payout_value
        ).toFixed(2);
        comment.created = moment
            .utc(comment.created)
            .local()
            .fromNow();
        comment.vote_count = comment.active_votes.length;
        comment.author_reputation = reputation(comment.author_reputation);
        comment.avatar = `https://steemitimages.com/u/${
            comment.author
        }/avatar/small`;
        comment.body = markDown2Html(comment.body);
    });
    return comments;
};
