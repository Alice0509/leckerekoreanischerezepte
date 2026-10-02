import {category} from './documents/category'
import {favoriteItem} from './documents/favoriteItem'
import {gallery} from './documents/gallery'
import {galleryEmbed} from './documents/galleryEmbed'
import {ingredient} from './documents/ingredient'
import {recipe} from './documents/recipe'
import {recipeIngredient} from './documents/recipeIngredient'
import {step} from './documents/step'

import {horizontalRule} from './objects/horizontalRule'
import {localizedGeopoint} from './objects/localizedGeopoint'
import {localizedNumber} from './objects/localizedNumber'
import {localizedPortableText} from './objects/localizedPortableText'
import {localizedSlug} from './objects/localizedSlug'
import {localizedString} from './objects/localizedString'
import {localizedText} from './objects/localizedText'
import {portableText} from './objects/portableText'

export const schemaTypes = [
  horizontalRule,
  portableText,
  localizedPortableText,
  localizedString,
  localizedText,
  localizedNumber,
  localizedSlug,
  localizedGeopoint,

  category,
  favoriteItem,
  gallery,
  galleryEmbed,
  ingredient,
  recipe,
  recipeIngredient,
  step,
]
