import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recipes } from '../data/recipes';
import type { FoodRecipe } from '../types';

const ageFilters = ['全部', '6-8个月', '8-10个月', '10-12个月', '12-18个月'];

function RecipeCard({ recipe }: { recipe: FoodRecipe }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.recipeCard}>
      <TouchableOpacity style={styles.recipeHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.recipeTitleArea}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>{recipe.ageRange}</Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.recipeDetail}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 食材</Text>
            {recipe.ingredients.map((ing, i) => (
              <Text key={i} style={styles.listItem}>· {ing}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👩‍🍳 做法</Text>
            {recipe.steps.map((step, i) => (
              <Text key={i} style={styles.listItem}>{i + 1}. {step}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💚 营养价值</Text>
            <Text style={styles.nutritionText}>{recipe.nutrition}</Text>
          </View>

          <View style={styles.tagsRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function RecipesScreen() {
  const [activeFilter, setActiveFilter] = useState('全部');

  const filteredRecipes =
    activeFilter === '全部' ? recipes : recipes.filter((r) => r.ageRange === activeFilter);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🥣 辅食食谱推荐</Text>
          <Text style={styles.headerSubtitle}>根据宝宝月龄推荐适合的辅食食谱</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          {ageFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterBtn, activeFilter === filter && styles.filterBtnActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterBtnText, activeFilter === filter && styles.filterBtnTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, color: '#999', marginTop: 4 },
  filterBar: { marginBottom: 16, flexGrow: 0 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterBtnActive: {
    borderColor: '#4caf50',
    backgroundColor: '#4caf50',
  },
  filterBtnText: { fontSize: 13, color: '#666' },
  filterBtnTextActive: { color: '#fff' },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  recipeTitleArea: {},
  recipeName: { fontSize: 16, fontWeight: '600', color: '#333' },
  ageBadge: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ageBadgeText: { fontSize: 12, color: '#4caf50' },
  recipeDetail: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  listItem: { fontSize: 14, color: '#555', lineHeight: 24 },
  nutritionText: { fontSize: 14, color: '#555', lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  tagText: { fontSize: 12, color: '#888' },
});
