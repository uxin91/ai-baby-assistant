import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recipes } from '../data/recipes';
import type { FoodRecipe } from '../types';
import { colors, layout, radius, shadow, softShadow } from '../theme';

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
        <View style={styles.chevron}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.recipeDetail}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>食材</Text>
            {recipe.ingredients.map((ing, i) => (
              <Text key={i} style={styles.listItem}>• {ing}</Text>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>做法</Text>
            {recipe.steps.map((step, i) => (
              <Text key={i} style={styles.listItem}>{i + 1}. {step}</Text>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>营养价值</Text>
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
  const filteredRecipes = activeFilter === '全部' ? recipes : recipes.filter((r) => r.ageRange === activeFilter);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="restaurant" size={22} color={colors.mint} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>辅食食谱</Text>
            <Text style={styles.headerSubtitle}>按月龄筛选，快速找到适合宝宝当前阶段的餐点。</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          {ageFilters.map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterBtn, activeFilter === filter && styles.filterBtnActive]} onPress={() => setActiveFilter(filter)}>
              <Text style={[styles.filterBtnText, activeFilter === filter && styles.filterBtnTextActive]}>{filter}</Text>
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
  container: { flex: 1, backgroundColor: colors.canvas },
  scrollContent: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: layout.pagePadding, paddingBottom: 34 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: colors.lineSoft, marginBottom: 16, ...shadow },
  headerIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#eaf8f4', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  filterBar: { marginBottom: 16, flexGrow: 0 },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: colors.surfaceSolid, marginRight: 8 },
  filterBtnActive: { borderColor: colors.mint, backgroundColor: colors.mint },
  filterBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: '700' },
  filterBtnTextActive: { color: '#fff' },
  recipeCard: { backgroundColor: colors.surfaceSolid, borderRadius: radius.lg, marginBottom: 12, borderWidth: 1, borderColor: colors.lineSoft, overflow: 'hidden', ...softShadow },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  recipeTitleArea: { flex: 1 },
  recipeName: { fontSize: 16, fontWeight: '800', color: colors.text },
  ageBadge: { backgroundColor: '#eaf8f4', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start', marginTop: 7 },
  ageBadgeText: { fontSize: 12, color: colors.mint, fontWeight: '800' },
  chevron: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#f6f8fc', alignItems: 'center', justifyContent: 'center' },
  recipeDetail: { paddingHorizontal: 15, paddingBottom: 15, borderTopWidth: 1, borderTopColor: colors.lineSoft },
  section: { marginTop: 13 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 6 },
  listItem: { fontSize: 14, color: colors.textMuted, lineHeight: 24 },
  nutritionText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#f6f8fc' },
  tagText: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
});
