import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AppService {

  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: InstanceType<typeof Pool>,
  ) { }

  // 

}
