import { verifyOptionnalBooleans, verifyId } from '../../decorator/decorator.dto.js';

export class UpdateUsersInterestsDto {
  @verifyId()
  userId!: number;

  @verifyOptionnalBooleans()
  technology?: boolean;
  
  @verifyOptionnalBooleans()
  sports?: boolean;
  
  @verifyOptionnalBooleans()
  music?: boolean;
  
  @verifyOptionnalBooleans()
  travel?: boolean;
  
  @verifyOptionnalBooleans()
  food?: boolean;
  
  @verifyOptionnalBooleans()
  movies?: boolean;
  
  @verifyOptionnalBooleans()
  books?: boolean;
  
  @verifyOptionnalBooleans()
  art?: boolean;
  
  @verifyOptionnalBooleans()
  nature?: boolean;
  
  @verifyOptionnalBooleans()
  fitness?: boolean;
}

