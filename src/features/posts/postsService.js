const postsModel = require("../../models/posts.model");
const mongoose = require('mongoose');
const createPost = async (createdBy, createdByType, title, description, images = []) => {
    try {
        if (!createdBy || !title || !description || !createdByType) {
            throw new Error("Missing required fields.");
        }

        const newPost = new postsModel({ createdBy, createdByType, title, description, images });
        await newPost.save();
        return newPost;
    } catch (error) {
        console.error("Error in createPost:", error);
        throw error;
    }
};

const getAllPosts = async (userId) => {
    try {
        const posts = await postsModel.find().sort({createdAt: -1}).lean(); // Convert to plain objects

        // Fetch all unique commenter IDs and types
        let commenterDetails = {};
        let uniqueCommenters = [];

        posts.forEach(post => {
            post.comments.forEach(comment => {
                const { commenterId, commenterType } = comment;
                if (!commenterDetails[commenterId]) {
                    uniqueCommenters.push({ commenterId, commenterType });
                    commenterDetails[commenterId] = null; // Placeholder
                }
            });
        });

        // Fetch all commenter details in parallel
        await Promise.all(uniqueCommenters.map(async ({ commenterId, commenterType }) => {
            const Model = mongoose.model(commenterType); // Get the correct model dynamically
            const user = await Model.findById(commenterId).select("username").lean();
            commenterDetails[commenterId] = user || {};
        }));

        // Attach commenter details to posts
        posts.forEach(post => {
            post.comments.forEach(comment => {
                comment.commenterDetails = commenterDetails[comment.commenterId] || null;
            });

            // Add isReacted property
            post.isReacted = post.usersReacted.includes(userId);
        });

        return posts;
    } catch (error) {
        console.error("Error in getAllPosts:", error);
        throw error;
    }
};



const createReact = async (postId, userId) => {
    try {
        const post = await postsModel.findById(postId);
        if (!post) throw new Error("Post not found");

        const index = post.usersReacted.indexOf(userId);
        if (index === -1) {
            post.usersReacted.push(userId);
        } else {
            post.usersReacted.splice(index, 1); // Remove reaction (toggle)
        }

        await post.save();
        return post;
    } catch (error) {
        console.error("Error in createReact:", error);
        throw error;
    }
};

const createComment = async (postId, commenterId, commenterType, commentText) => {
    try {
        const post = await postsModel.findById(postId);
        if (!post) throw new Error("Post not found");

        const newComment = {
            commenterId,
            commenterType,
            commentText,
        };

        post.comments.push(newComment);
        await post.save();
        return post;
    } catch (error) {
        console.error("Error in createComment:", error);
        throw error;
    }
};

const deletePost = async (postId, userId) => {
    try {
        const post = await postsModel.findById(postId);
        if (!post) throw new Error("Post not found");

        if (post.createdBy.toString() !== userId.toString()) {
            throw new Error("Unauthorized: You can only delete your own posts");
        }

        await postsModel.deleteOne({ _id: postId });

        return { message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error in deletePost:", error);
        throw error;
    }
};

const getUserPosts = async (userId) => {
    try {
        return await postsModel.find({ createdBy: userId }).populate({
            path: "comments.commenterId", // Populate commenter details
            select: "name email createdByType", // Select only relevant fields
        });
    } catch (error) {
        console.error("Error in getUserPosts:", error);
        throw error;
    }
};

module.exports = {
    createPost,
    getAllPosts,
    createReact,
    createComment,
    deletePost,
    getUserPosts,
};
