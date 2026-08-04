import React, { useCallback, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { buildSearchQuery, SearchType } from '@ecency/sdk';
import { MainButton } from '../mainButton';
import { Tag } from '../basicUIElements';
import {
  EMPTY_SEARCH_FILTERS,
  type SearchDateOption,
  type SearchFilters,
  type SearchSortOption,
  validateSearchQuery,
} from './searchFilters';

const FALLBACK_SHEET_ID = 'search_filters';

/**
 * Result of the sheet. Both variants are objects because
 * react-native-actions-sheet 0.9.7 publishes `data || payloadRef.current` on
 * close (dist/src/index.js:403), so a falsy return value is silently replaced
 * by the original payload object. A `false`/`undefined` cancel contract would
 * therefore reach the caller as a truthy object and read as an apply.
 */
export interface SearchFiltersResult {
  filters?: SearchFilters;
  cancelled?: boolean;
}

const DATE_OPTIONS: SearchDateOption[] = ['all', 'week', 'month', 'year'];
const SORT_OPTIONS: SearchSortOption[] = ['relevance', 'popularity', 'newest'];
const TYPE_OPTIONS: SearchType[] = [SearchType.ALL, SearchType.POST, SearchType.COMMENT];

/**
 * Advanced search filters for the posts tab.
 *
 * The query these produce is assembled by @ecency/sdk's buildSearchQuery, the
 * same one the website uses, so the tokens it emits parse identically in the
 * search API. Validation mirrors what that API enforces (query_validator), so a
 * query it would reject is reported here instead of coming back as an
 * unexplained empty result.
 *
 * Resolves the SheetManager.show promise with `{ filters }` on apply and
 * `{ cancelled: true }` on cancel. Dismissing by backdrop, swipe or back button
 * resolves the original payload object instead (see SearchFiltersResult), so
 * callers must gate on `filters` being an object rather than on truthiness.
 */
const SearchFiltersSheet: React.FC<SheetProps<'search_filters'>> = ({ sheetId, payload }) => {
  const intl = useIntl();
  const closedRef = useRef(false);

  const [filters, setFilters] = useState<SearchFilters>(payload?.filters ?? EMPTY_SEARCH_FILTERS);
  const [error, setError] = useState('');

  const _reset = useCallback(() => {
    closedRef.current = false;
    setFilters(payload?.filters ?? EMPTY_SEARCH_FILTERS);
    setError('');
  }, [payload]);

  const _close = useCallback(
    (result: SearchFiltersResult) => {
      if (closedRef.current) {
        return;
      }
      closedRef.current = true;
      SheetManager.hide(sheetId ?? FALLBACK_SHEET_ID, { payload: result });
    },
    [sheetId],
  );

  const _set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setError('');
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const _apply = () => {
    // Validate the query that is actually sent. The free text lives in the
    // search bar, not here, so the caller passes it in to be measured with the
    // filters rather than after them.
    const built = buildSearchQuery({
      search: payload?.searchValue ?? '',
      author: filters.author,
      type: filters.type,
      category: filters.category,
      tags: filters.tags,
    });
    const validationError = validateSearchQuery(built.q);
    if (validationError) {
      setError(intl.formatMessage({ id: validationError.id }, validationError.values));
      return;
    }

    _close({ filters });
  };

  const _renderField = (
    key: 'author' | 'category' | 'tags',
    labelId: string,
    placeholderId: string,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{intl.formatMessage({ id: labelId })}</Text>
      <TextInput
        style={styles.input}
        value={filters[key]}
        onChangeText={(value) => _set(key, value)}
        placeholder={intl.formatMessage({ id: placeholderId })}
        placeholderTextColor={EStyleSheet.value('$iconColor')}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );

  // Chips rather than a dropdown: every option set here is three or four items,
  // and the same Tag component already backs the feed's filter bar.
  const _renderChoice = <T extends string>(
    labelId: string,
    options: T[],
    selected: T,
    labelFor: (option: T) => string,
    onSelect: (option: T) => void,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{intl.formatMessage({ id: labelId })}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => (
          <Tag
            key={option || 'all'}
            value={option}
            label={labelFor(option)}
            isFilter={true}
            isPin={option === selected}
            onPress={() => onSelect(option)}
            style={styles.chip}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ActionSheet
      id={sheetId ?? FALLBACK_SHEET_ID}
      onBeforeShow={_reset}
      gestureEnabled={true}
      containerStyle={styles.container}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'search_result.filters.title' })}
        </Text>

        {_renderField(
          'author',
          'search_result.filters.author',
          'search_result.filters.author_placeholder',
        )}
        {_renderField(
          'category',
          'search_result.filters.category',
          'search_result.filters.category_placeholder',
        )}
        {_renderField(
          'tags',
          'search_result.filters.tags',
          'search_result.filters.tags_placeholder',
        )}

        {_renderChoice(
          'search_result.filters.type',
          TYPE_OPTIONS,
          filters.type,
          (option) =>
            intl.formatMessage({
              id:
                option === SearchType.POST
                  ? 'search_result.filters.type_post'
                  : option === SearchType.COMMENT
                  ? 'search_result.filters.type_comment'
                  : 'search_result.filters.type_all',
            }),
          (option) => _set('type', option),
        )}

        {_renderChoice(
          'search_result.filters.date',
          DATE_OPTIONS,
          filters.date,
          (option) => intl.formatMessage({ id: `search_result.filters.date_${option}` }),
          (option) => _set('date', option),
        )}

        {/* Sort labels already exist in every locale, from a filter UI that was
            started and never shipped. Reusing them keeps this translated. */}
        {_renderChoice(
          'search_result.filters.sort',
          SORT_OPTIONS,
          filters.sort,
          (option) => intl.formatMessage({ id: `search_result.post_result_filter.${option}` }),
          (option) => _set('sort', option),
        )}

        {!!error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <MainButton
          style={styles.applyButton}
          onPress={_apply}
          text={intl.formatMessage({ id: 'search_result.filters.apply' })}
        />
      </View>
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$primaryBackgroundColor',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  indicator: {
    backgroundColor: '$iconColor',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  title: {
    color: '$primaryDarkText',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 6,
  },
  label: {
    color: '$primaryDarkText',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    color: '$primaryDarkText',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: {
    color: '$primaryRed',
    fontSize: 13,
    marginBottom: 12,
  },
  applyButton: {
    marginTop: 8,
  },
});

export default SearchFiltersSheet;
