<?php
/**
 * Plugin Name: Extend REST API for Posts
 * Description: Allows sorting by 'meta_value' and 'meta_value_num' in the REST API for posts.
 * Version: 1.0
 */

 if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
/**
 * Fügt 'meta_value' und 'meta_value_num' zur Liste der erlaubten Sortier-Werte für Posts hinzu.
 *
 * @param array $params Die REST API Parameter.
 * @return array Die modifizierten Parameter.
 */
function allow_meta_query_orderby_for_posts( $params ) {
    // Fügt 'meta_value' zur Liste der erlaubten Sortier-Werte hinzu
    $params['orderby']['enum'][] = 'meta_value';
    
    // Fügt 'meta_value_num' hinzu (nützlich für die Sortierung nach reinen Zahlen)
    $params['orderby']['enum'][] = 'meta_value_num';

    return $params;
}
add_filter( 'rest_post_collection_params', 'allow_meta_query_orderby_for_posts' );
